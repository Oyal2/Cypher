package main

import (
	"cypher/postgres"
	"database/sql"
	"encoding/base64"
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func main() {
	err := godotenv.Load("../.env")
	if err != nil {
		log.Fatal(err)
	}

	app := fiber.New()
	app.Use(cors.New())
	api := app.Group("/api/cypher")

	db := postgres.ConnectToDB()
	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	api.Post("/register", func(c *fiber.Ctx) error {
		c.Accepts("application/json")
		accountInfo := new(postgres.AccountInfo)
		if err := c.BodyParser(accountInfo); err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: err.Error()})
		}

		if accountInfo.Email == "" || accountInfo.Password == "" || accountInfo.Username == "" {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: "missing register information"})
		}

		//Check if user exists
		ok, err := postgres.UserExists(accountInfo.Username, accountInfo.Email, db)

		if ok {
			c.Status(fiber.StatusBadRequest)
			if err != nil {
				return c.JSON(ErrorResponse{Error: err.Error()})
			} else {
				return c.JSON(ErrorResponse{Error: "That username or email already exists"})
			}
		}
		//Register User
		err = postgres.RegisterUser(accountInfo, db)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			if err != nil {
				return c.JSON(ErrorResponse{Error: err.Error()})
			}
		}
		c.SendStatus(200)
		return c.JSON(ErrorResponse{Error: ""})
	})

	api.Post("/login", func(c *fiber.Ctx) error {
		c.Accepts("application/json")
		accountInfo := new(postgres.AccountInfo)
		if err := c.BodyParser(accountInfo); err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: err.Error()})
		}

		if accountInfo.Username == "" || accountInfo.Password == "" {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: "missing register information"})
		}

		//Check if user exists
		email, err := postgres.GetUser(accountInfo.Username, accountInfo.Password, db)
		if len(email) == 0 {
			c.Status(fiber.StatusBadRequest)
			if err != nil {
				return c.JSON(ErrorResponse{Error: err.Error()})
			} else {
				return c.JSON(ErrorResponse{Error: "That username or email already exists"})
			}
		}

		sessionID, err := postgres.CreateOrUpdateSessionId(email, db)

		if len(sessionID) == 0 {
			c.Status(fiber.StatusBadRequest)
			if err != nil {
				return c.JSON(ErrorResponse{Error: err.Error()})
			}
		}

		c.SendStatus(200)

		sessionCookie := &fiber.Cookie{
			Name:    "sessionid",
			Value:   sessionID,
			Expires: time.Now().Add(24 * time.Hour),
		}
		k := &fiber.Cookie{
			Name:    "k",
			Value:   base64.StdEncoding.EncodeToString(postgres.Hash(accountInfo.Password)),
			Expires: time.Now().Add(24 * time.Hour),
		}
		c.Cookie(sessionCookie)
		c.Cookie(k)
		return c.JSON(ErrorResponse{Error: ""})
	})

	api.Get("/info", func(c *fiber.Ctx) error {
		email, kek := verify(c, db)
		if len(email) == 0 || len(kek) == 0 {
			c.Status(fiber.StatusForbidden)
			return nil
		}

		profiles, err := postgres.FetchProfiles(email, kek, db)

		if err != nil {
			c.Status(fiber.StatusBadRequest)
			if err != nil {
				return c.JSON(ErrorResponse{Error: err.Error()})
			}
		}

		return c.JSON(profiles)
	})

	api.Post("/create_profile", func(c *fiber.Ctx) error {
		c.Accepts("application/json")
		profile := new(postgres.ProfileCard)
		if err := c.BodyParser(profile); err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: err.Error()})
		}

		if profile.Username == "" || profile.Password == "" || profile.Company == "" {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: "missing information"})
		}

		email, kek := verify(c, db)
		if len(email) == 0 || len(kek) == 0 {
			c.Status(fiber.StatusForbidden)
			return nil
		}
		dek, err := postgres.FetchDEK(email, kek, db)

		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: err.Error()})
		}
		err = postgres.AddProfile(profile, dek, email, db)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: err.Error()})
		}

		c.SendStatus(200)
		return c.JSON(ErrorResponse{Error: ""})
	})

	api.Post("/delete_card", func(c *fiber.Ctx) error {
		c.Accepts("application/json")
		deleteCard := new(postgres.DeleteCard)
		deleteCard.Index = -1
		if err := c.BodyParser(deleteCard); err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: err.Error()})
		}

		if deleteCard.Index == -1 {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: "missing information"})
		}

		email, kek := verify(c, db)
		if len(email) == 0 || len(kek) == 0 {
			c.Status(fiber.StatusForbidden)
			return nil
		}

		err = postgres.DeleteProfile(deleteCard.Index, email, db)
		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: err.Error()})
		}

		c.SendStatus(200)
		return c.JSON(ErrorResponse{Error: ""})
	})

	api.Post("/edit_card", func(c *fiber.Ctx) error {
		c.Accepts("application/json")
		editCard := new(postgres.ProfileCardIndex)
		editCard.Index = -1
		if err := c.BodyParser(editCard); err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: err.Error()})
		}

		if editCard.Username == "" || editCard.Password == "" || editCard.Company == "" || editCard.Index == -1 {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: "missing information"})
		}

		email, kek := verify(c, db)
		if len(email) == 0 || len(kek) == 0 {
			c.Status(fiber.StatusForbidden)
			return nil
		}

		dek, err := postgres.FetchDEK(email, kek, db)

		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: err.Error()})
		}

		err = postgres.EditProfile(&postgres.ProfileCard{
			Username: editCard.Username,
			Password: editCard.Password,
			Company:  editCard.Company,
		}, editCard.Index, email, dek, db)

		if err != nil {
			c.Status(fiber.StatusBadRequest)
			return c.JSON(ErrorResponse{Error: err.Error()})
		}

		c.SendStatus(200)
		return c.JSON(ErrorResponse{Error: ""})
	})

	fmt.Println("Connected!")

	app.Listen(":4445")
}

func verify(c *fiber.Ctx, db *sql.DB) (string, string) {
	sessionID := c.Cookies("sessionid")
	kek := c.Cookies("k")
	if len(kek) == 0 || len(sessionID) == 0 {
		c.ClearCookie("sessionid")
		c.ClearCookie("k")
		c.Status(fiber.StatusForbidden)
		c.JSON(ErrorResponse{Error: "invalid credentials"})
		return "", ""
	}

	email, err := postgres.FindSessionId(sessionID, db)

	if len(email) == 0 {
		c.Status(fiber.StatusBadRequest)
		if err != nil {
			c.JSON(ErrorResponse{Error: err.Error()})
			return "", ""
		} else {
			c.JSON(ErrorResponse{Error: "session is not found"})
			return "", ""
		}
	}

	return email, kek
}
