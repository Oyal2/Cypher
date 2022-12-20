package postgres

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	_ "github.com/lib/pq"
)

type AccountInfo struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type ProfileCard struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Company  string `json:"company"`
}

type DeleteCard struct {
	Index int `json:"index"`
}

func ConnectToDB() *sql.DB {
	// Connect to database
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DBHOST"), os.Getenv("DBPORT"), os.Getenv("DBUSER"), os.Getenv("DBPASSWORD"), os.Getenv("DBNAME"))
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatal(err)
	}
	return db
}

func UserExists(user string, email string, db *sql.DB) (bool, error) {
	rows, err := db.Query(fmt.Sprintf(`SELECT * FROM accounts WHERE username = '%s' OR email = '%s';`, user, email))
	defer rows.Close()
	if err != nil {
		log.Fatal(err)
		return false, err
	}
	return rows.Next(), nil
}

func FetchProfiles(email, kek string, db *sql.DB) (arr []string, err error) {
	query := fmt.Sprintf(`SELECT * FROM profiles WHERE email = '%s';`, email)
	rows, err := db.Query(query)
	defer rows.Close()
	if err != nil {
		log.Fatal(err)
		return arr, err
	}

	var (
		e    string
		info []string
		key  string
	)

	for rows.Next() {
		err := rows.Scan(&e, (*pq.StringArray)(&info), &key)
		if err != nil {
			return arr, err
		}
		if len(key) == 0 {
			return arr, errors.New("invalid information")
		}
		newKek, _ := base64.StdEncoding.DecodeString(kek)
		dek, err := Decryption(key, newKek, true)
		if err != nil {
			return nil, errors.New("error decrypting information")
		}

		for _, profile := range info {
			if len(profile) > 0 {
				decryptedInfo, _ := Decryption(profile, []byte(dek), true)
				arr = append(arr, decryptedInfo)
			}
		}
	}

	return arr, nil
}

func GetUser(user string, password string, db *sql.DB) (string, error) {
	rows, err := db.Query(fmt.Sprintf(`SELECT * FROM accounts WHERE username = '%s' OR email = '%s';`, user, user))
	defer rows.Close()
	if err != nil {
		log.Fatal(err)
		return "", err
	}
	var (
		userId         int
		username       string
		hashedPassword string
		email          string
		createdOn      time.Time
		lastLogin      interface{}
	)

	for rows.Next() {
		err := rows.Scan(&userId, &username, &hashedPassword, &email, &createdOn, &lastLogin)
		if err != nil {
			return "", err
		}
		if CheckPasswordHash(password, hashedPassword, "") {
			return email, nil
		}
	}

	return "", errors.New("incorrect information")
}

func FindSessionId(sessionId string, db *sql.DB) (string, error) {
	query := fmt.Sprintf(`
		select * from user_sessions where session_id = '%s'
	`, sessionId)
	rows, err := db.Query(query)
	defer rows.Close()
	if err != nil {
		log.Fatal(err)
		return "", err
	}

	var (
		email      string
		session_id string
		createdAt  string
		ipAddress  string
		userAgent  string
	)

	for rows.Next() {
		err := rows.Scan(&email, &session_id, &createdAt, &ipAddress, &userAgent)
		if err != nil {
			return "", err
		}
		if len(email) != 0 {
			return email, nil
		}
	}

	return "", nil
}

func CreateOrUpdateSessionId(email string, db *sql.DB) (string, error) {
	uuid := strings.ReplaceAll(uuid.NewString(), "-", "")

	query := fmt.Sprintf(`
		INSERT INTO user_sessions
		VALUES ('%s', '%s',NOW(),'test','test')
		ON CONFLICT(email)
		DO UPDATE SET session_id = excluded.session_id, created_at = excluded.created_at;
	`, email, uuid)
	rows, err := db.Query(query)
	defer rows.Close()
	if err != nil {
		log.Fatal(err)
		return "", err
	}

	return uuid, nil
}

func RegisterUser(accountInfo *AccountInfo, db *sql.DB) error {
	//Create a key encryption key
	kek := Hash(accountInfo.Password)
	//Create an uuid and encrypt it with KEK
	id := strings.ReplaceAll(uuid.NewString(), "-", "")
	dek, err := Encryption(id, kek)
	if err != nil {
		return err
	}

	//Insert account information to accounts table
	rows, err := db.Query(fmt.Sprintf(`INSERT INTO profiles (email,info,key) VALUES ('%s', NULL,'%s');`, accountInfo.Email, dek))

	defer rows.Close()
	if err != nil {
		log.Fatal(err)
		return err
	}

	hashedPass, err := HashPassword(accountInfo.Password)
	if err != nil {
		return errors.New("error processing information")
	}

	//Insert account information to accounts table
	rows, err = db.Query(fmt.Sprintf(`INSERT INTO accounts (username,password,email,created_on) VALUES ('%s', '%s','%s', NOW());`, accountInfo.Username, hashedPass, accountInfo.Email))
	if err != nil {
		log.Fatal(err)
		return err
	}

	return nil
}

func FetchDEK(email, kek string, db *sql.DB) (string, error) {
	query := fmt.Sprintf(`SELECT * FROM profiles WHERE email = '%s';`, email)
	rows, err := db.Query(query)
	defer rows.Close()
	if err != nil {
		log.Fatal(err)
		return "", err
	}

	var (
		e    string
		info []uint8
		key  string
	)

	for rows.Next() {
		err := rows.Scan(&e, &info, &key)
		if err != nil {
			return "", err
		}
		if len(key) == 0 {
			return "", errors.New("invalid information")
		}
		newKek, _ := base64.StdEncoding.DecodeString(kek)
		dek, err := Decryption(key, newKek, true)
		if err != nil {
			return "", errors.New("error decrypting information")
		}
		return dek, nil
	}

	return "", nil
}

func AddProfile(profile *ProfileCard, dek, email string, db *sql.DB) error {
	profileJson, err := json.Marshal(profile)
	if err != nil {
		log.Fatal(err)
		return err
	}

	fmt.Println(dek)
	encData, err := Encryption(string(profileJson), []byte(dek))
	if err != nil {
		log.Fatal(err)
		return err
	}

	query := fmt.Sprintf(`update profiles SET info = array_append(info,'%s') where email = '%s';`, encData, email)
	rows, err := db.Query(query)
	defer rows.Close()
	if err != nil {
		log.Fatal(err)
		return err
	}

	return nil
}

func DeleteProfile(index int, email string, db *sql.DB) error {
	query := fmt.Sprintf(`
		do $$
		declare
		   infoArr text[];
		   index integer := %d;
		begin
		   select info
		   into infoArr
		   FROM profiles WHERE email = '%s';
		
		   if array_length(infoArr,1) = 1 and index = 0 then
			  update profiles SET info = '{}' where email = '%s';
		   elsif array_length(infoArr,1) > 0 then 
			  if index = 0 then
				  update profiles SET info = info[2:] where email = '%s';
			  elsif index = array_length(infoArr,1) - 1 then
				  update profiles SET info = info[:array_length(infoArr,1)-1] where email = '%s';
			  else
				  update profiles SET info = info[:index] || info[index+2:] where email = '%s';
			  end if;
		   end if;
			  
		end; $$;
`, index, email,email,email,email,email)
	rows, err := db.Query(query)
	defer rows.Close()
	if err != nil {
		log.Fatal(err)
		return err
	}

	return nil
}
