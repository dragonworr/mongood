# Mongood

MongoDB Operation Dashboard

[![](https://img.shields.io/docker/cloud/build/renzholy/mongood)](https://hub.docker.com/r/renzholy/mongood)

## 🔮 Features:

- [x] [mongo-shell data types](https://docs.mongodb.com/manual/core/shell-types/) query grammar
- [x] safely query & sort using [indexes](https://docs.mongodb.com/manual/tutorial/sort-results-with-indexes/)
- [x] built with [Microsoft Fluent UI](https://developer.microsoft.com/en-us/fluentui)
- [ ] and so on...

## 🚧 Roadmap:

- [ ] dark mode
- [ ] doc insert, update and delete
- [ ] index create and drop
- [ ] geo search
- [ ] json schema
- [ ] role management
- [ ] and so on...

## 🔧 Usage:

### Client Mode:

```shell
npm run build && cd client && go run main.go
```

### Server Mode:

```shell
docker run -p 3000:3000 -e MONGO_URL="mongodb://localhost:27017" renzholy/mongood
```

### Dev dev:

```shell
npm run dev & cd server && go run main.go
```

## 📷 Screenshots:

![](/screenshots/docs.png)

![](/screenshots/indexes.png)

![](/screenshots/ops.png)
