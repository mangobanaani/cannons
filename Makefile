.PHONY: serve test e2e build run stop clean

serve:
	npx serve . -l 3000

test:
	node --test tests/*.test.js

e2e:
	npx playwright test

build:
	docker build -t cannons .

run: build
	docker run -d --name cannons -p 8080:80 cannons

stop:
	docker stop cannons && docker rm cannons

clean:
	docker rmi cannons 2>/dev/null || true
