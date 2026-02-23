const {createServer} = require("node:http");
const storage = require("./storage");
const config = require("./config");

const readBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            try {
                body += chunk.toString();
            } catch (err) {
                reject(err);
            }
        });
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(err);
            }
        });
        req.on("error", (err) => {
            reject(err);
        });
    });
}

// створюємо сервер, там усі наші методи POST,GET,PATCH, DELETE
const server = createServer((req, res) => {
    const method = req.method;
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    res.setHeader("Content-Type", "application/json;charset=utf-8");

    // --- GET: Список з фільтрацією по query param 'room'
    if (method === "GET" && pathname === "/device") {
        let results = [];
        const roomFilter = parsedUrl.searchParams.get("room");
        if (roomFilter) {
            results = storage.fetch((e) => e.room.toLowerCase() === roomFilter.toLowerCase());
        } else {
            results = storage.fetch();
        }

        res.statusCode = 200;
        return res.end(
            JSON.stringify({
                data: results,
                total: results.length,
            }),
        );
    }

    // --- POST: Додавання страви ---
    if (method === "POST" && pathname === "/device") {
        readBody(req)
            .then((data) => {
            try {
                const instance = storage.add(data)

                res.statusCode = 201;
                res.end(JSON.stringify({data: instance}));
            } catch (err) {
                res.statusCode = 422;
                res.end(JSON.stringify({error: err.message}));
            }
        })
            .catch((err) => {
                res.statusCode = 400;
                res.end(JSON.stringify({error: err.message}));
            });

        return;
    }

    // --- PATCH: Оновлення страви (наприклад, ціни) ---
    if (method === "PATCH" && pathname.startsWith("/device/")) {
        const id = parseInt(pathname.split("/")[2]);

        readBody(req)
            .then((updates) => {
                try {
                    const updated = storage.update(id, updates);
                    if (updated) {
                        res.statusCode = 200;
                        res.end(JSON.stringify({data: updated}));
                    } else {
                        res.statusCode = 404;
                        res.end(JSON.stringify({error: "Not Found"}));
                    }
                } catch (err) {
                    res.statusCode = 422;
                    res.end(JSON.stringify({error: err.message}));
                }
            })
            .catch((err) => {
                res.statusCode = 400;
                res.end(JSON.stringify({error: err.message}));
            });

        return;
    }

    // --- DELETE: Видалення страви ---
    if (method === "DELETE" && pathname.startsWith("/device/")) {
        const id = parseInt(pathname.split("/")[2]);
        try {
            const removed = storage.remove(id);
            if (removed === true) {
                res.statusCode = 204;
                res.end();
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({error: "Not Found"}));
            }
        } catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({error: err.message}));
        }
        return;
    }

    // 404
    res.statusCode = 404;
    res.end(JSON.stringify({error: "Route not found"}));
});

// Ми повинні вивести логи що сервер успішно запустився.
server.listen(config.port, config.host, () => {
    console.log(`Server running at http://${config.host}:${config.port}/`);
});