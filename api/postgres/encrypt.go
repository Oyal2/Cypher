package postgres

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha1"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"github.com/mergermarket/go-pkcs7"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/crypto/pbkdf2"
	"io"
	"log"
	"os"
)

var SecretKey = os.Getenv("SECRET_KEY")

func Encryption(plaintext string, ckey []byte) (string, error) {

	key := []byte(ckey)
	plainText := []byte(plaintext)
	plainText, err := pkcs7.Pad(plainText, aes.BlockSize)
	if err != nil {
		return "", fmt.Errorf(`plainText: "%s" has error`, plainText)
	}
	if len(plainText)%aes.BlockSize != 0 {
		err := fmt.Errorf(`plainText: "%s" has the wrong block size`, plainText)
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	cipherText := make([]byte, aes.BlockSize+len(plainText))
	iv := cipherText[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}

	mode := cipher.NewCBCEncrypter(block, iv)
	mode.CryptBlocks(cipherText[aes.BlockSize:], plainText)
	return base64.StdEncoding.EncodeToString(cipherText), nil
}

func Decryption(encrypted string, ckey []byte , isBase64 bool) (string, error) {
	key := []byte(ckey)
	var cipherText []byte
	if isBase64 {
		cipherText, _ = base64.StdEncoding.DecodeString(encrypted)
	} else {
		cipherText, _ = hex.DecodeString(encrypted)
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		log.Println(fmt.Sprintf("[Decryption Error] %v", err))
		return "", err
	}

	if len(cipherText) < aes.BlockSize {
		return "", fmt.Errorf("Block size is too small")
	}
	iv := cipherText[:aes.BlockSize]
	cipherText = cipherText[aes.BlockSize:]
	if len(cipherText)%aes.BlockSize != 0 {
		return "", fmt.Errorf("Cipher Text is not a multiple of Blocksize")
	}

	mode := cipher.NewCBCDecrypter(block, iv)
	mode.CryptBlocks(cipherText, cipherText)

	cipherText, _ = pkcs7.Unpad(cipherText, aes.BlockSize)
	return fmt.Sprintf("%s", cipherText), nil
}

func HashPassword(password string) (string,error){
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash , salt string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func Hash(password string) []byte{
	dk := pbkdf2.Key([]byte(password),  []byte(SecretKey), 4096, 32, sha1.New)
	return dk
}

func CheckHash(password, hash string) bool {
	df := base64.StdEncoding.EncodeToString(pbkdf2.Key([]byte(password), []byte(SecretKey), 4096, 32, sha1.New))
	return hash == df
}
