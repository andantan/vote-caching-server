# Blockchain Voting System

This project is part of a **graduation capstone** system consisting of three main components that together form a blockchain-based voting platform.

---

## System Architecture Overview

| Component                                | Description                                                                                            | Repository                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| **Blockchain Node**                      | Core blockchain engine responsible for recording votes and maintaining consensus.                      | [vote-blockchain-server](https://github.com/andantan/vote-blockchain-server)                                                    |
| **API Gateway & User Management Server** | Handles REST API requests, authentication, and communication between the frontend and blockchain node. | [vote-service-server](https://github.com/andantan/vote-service-server) |
| **MongoDB Caching Server**               | Caches blockchain data and transaction metadata for faster queries.                                    | *(this repository)* |

All three services **must be running** for the system to function correctly.

---

## Prerequisites

* NodeJS 22.14
* MongoDB
* GNU Make

---

## Environment Configuration

You must create a `.env` file in the root directory before running the project.

📄 **Reference:** See `.env.example` for required environment variables and example values.

```bash
cp .env.example .env
# then edit .env with your configuration
```

---

## Repositories Setup

Clone all three repositories:

```bash
git clone https://github.com/andantan/vote-caching-server
cd vote-caching-server

# also clone dependent servers
git clone https://github.com/andantan/vote-service-server

git clone https://github.com/andantan/vote-blockchain-server
```

---

## Build & Run Instructions

### 1️⃣ Build the Blockchain Node

```bash
make build
```

or directly run:

```bash
make run-cache-server
```

Command definition:

```makefile
run-cache-server: build
	@$(CLEAR_COMMAND)
	@echo "Starting the application..."
	@npm run start
```

---

## Contact

Maintainer: kyubin2892@gmail.com

---