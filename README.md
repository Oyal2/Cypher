<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="https://user-images.githubusercontent.com/13637813/209063334-178970e4-ccac-44d5-a132-5fc5989cab8c.png" alt="Project logo"></a>
</p>

<p align="center">  A web app that provides a safe and secure password management tool to its users
    <br> 
</p>
<h2 align="center"><a target="_blank" href="https://oyal2.com/cypher" rel="nofollow">Demo</a></h2>

<div align="center">

  [![Status](https://img.shields.io/badge/status-active-success.svg)]() 
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---
 <img width=auto height=autopx src="https://user-images.githubusercontent.com/13637813/209065016-49f969c6-d983-4a89-9039-d94e09f4cb43.PNG" alt="Project logo"></a>
## 📝 Table of Contents
- [📝 Table of Contents](#-table-of-contents)
- [🧐 About ](#-about-)
- [💡 Features](#-features)
- [💭 How it works ](#-how-it-works-)
  - [Encryption](#encryption)
      - [Figure of the Key Encryption Key Protocol](#figure-of-the-key-encryption-key-protocol)
      - [Figure of the Decryption Encryption Key Encrypt Protocol](#figure-of-the-decryption-encryption-key-encrypt-protocol)
      - [Figure of the Private Data Encryption Protocol](#figure-of-the-private-data-encryption-protocol)
  - [Session Id](#session-id)
  - [Delete Account](#delete-account)
- [⛏️ Built Using ](#️-built-using-)


## 🧐 About <a name = "about"></a>
Cypher is a simple but elegant password manager. This application is a tool that should be used
by everyone who has a presence on the internet. The well-designed platform allows its users to
store and manage passwords using the latest password hashing and other cyber security technologies. Most of the password managers that are available in the market are either too complicated for the general population
to understand or are too insecure for people to trust. Cypher tries to bridge this gap by
providing its users with a secure, trustworthy and user friendly platform.


## 💡 Features
- Web Application hosted and communicated through an SSL.
- User-friendly UI/UX.
- Safe authentication capabilities for Login and Signing Up.
- Strong encryption and decryption standards for managing and storing passwords.
- Simple interface that enables its users to easily add and delete passwords to the portal.
- Simple profile management for Cypher password and account management.
- Single page password management portal that acts as a one-stop-shop for all stored passwords

## 💭 How it works <a name = "how_it_works"></a>
The web application is very protective about its user's accounts and personal data. We protect the user's information through heavy encryption and protocols.

We hash and salt our user's account password with bcrypt. The salt for the hash output is the master password that is set in the .env file.


### Encryption
This application takes private data very securely and goes through extreme measures to protect a user's data. In order for this security protocol to work we need to have two encryption keys. One encryption key, `Decryption Encryption Key (DEK)`, is used to encrypt the user's accounts that are saved in cypher. The DEK is a random UUIDv4 and is unique to each cypher user. Another encrpytion key, `Key Encrpytion Key (KEK)`, is used to encrypt the `decryption key (DEK)`, so an attacker cant breach our database and use the DEK to decrpyt the personal data. The KEK is created by hashing the user's plain-text password and salting it with cypher's master password, which is set in the .env file. The key derivation function that is used is `pbkdf2`.

Here are some images of the protocols:


 <img width=auto height=auto src="https://user-images.githubusercontent.com/13637813/209087084-40d5bdab-4fe4-403e-88f0-f8d69aa149dc.png" alt="Private Data Encryption Protocol"></a>
##### Figure of the Key Encryption Key Protocol

 <img width=auto height=auto src="https://user-images.githubusercontent.com/13637813/209088233-8bf323bd-f432-4fcb-9cbb-ae0eb4c04c28.png" alt="Private Data Encryption Protocol"></a>
##### Figure of the Decryption Encryption Key Encrypt Protocol

 <img width=auto height=auto src="https://user-images.githubusercontent.com/13637813/209083262-4c90683b-0933-4e3b-82f2-22f4ecc2345f.png" alt="Private Data Encryption Protocol"></a>
##### Figure of the Private Data Encryption Protocol

### Session Id
In order to gain access to user api calls a user must have a valid `sessionID` and `K (Key Encryption Key)` cookie. Both are checked for authentication and if both information does not match up you are denied calls about the user's information and homepage. 

### Delete Account
If the user no longer wants to use Cypher they can delete their account, which also deletes all related information in the database. There will be a simple user prompt asking for a confirmation, and on success you will be logged out and terminated.

## ⛏️ Built Using <a name = "built_using"></a>
- [Postgres](https://www.postgresql.org/) - Database
- [Fiber](https://gofiber.io/) - Server Framework
- [ReactJs](https://reactjs.org/) - Web Framework
- [Typescript](https://www.typescriptlang.org/) - Front End Language
- [Golang](https://go.dev/) - Back End Language

