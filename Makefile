ifeq ($(OS),Windows_NT) 
	CLEAR_COMMAND = @cls
else 
	CLEAR_COMMAND = @clear
endif

install:
	@echo "Installing npm dependencies..."
	@npm install

init: 
	@echo "Generate protoc interfaces"
	@npm run init

build:
	@echo "Building the TypeScript project..."
	@npm run build

all: init build
deploy: install init build

run:
	@$(CLEAR_COMMAND)
	@echo "Starting the application..."
	@npm run start

clean:
	@echo "Cleaning interfaces & .js files"
	@npm run clean
