/* Використовуємо вбудований модуль */
const {createServer} = require("node:http");

// Тув ваш варіант даних, залежно від варіанта.
let MENU = [
    {
        id: 1,
        name: "Піца Гуцульська",
        category: "Піца",
        price: 250,
        available: true,
    },
    {
        id: 2, name: "Борщ", category: "Супи", price: 120,
        available: true
    },
    {
        id: 3, name: "Чизкейк", category: "Десерти", price: 150,
        available: false
    },
];

// Читаємо налаштування з .env (використовуємо значення за замовчуванням, якщо .env відсутній)
const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || "localhost";

// створюємо сервер, там усі наші методи POST,GET,PATCH, DELETE
const server = createServer((req, res) => {
    const method = req.method;
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    res.setHeader("Content-Type", "application/json;charset=utf-8");

    // --- GET: Список страв з фільтрацією по query param 'category'
    if (method === "GET" && pathname === "/menu") {
        const category = parsedUrl.searchParams.get("category");
        let results = [...MENU];
        if (category) {
            results = results.filter(
                (dish) => dish.category.toLowerCase() ===
                    category.toLowerCase(),
            );
        }
        res.statusCode = 200;
        return res.end(
            JSON.stringify({
                count: results.length,
                items: results,
            }),
        );
    }

    // --- POST: Додавання страви ---
    if (method === "POST" && pathname === "/menu") {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            try {
                const data = JSON.parse(body);
                if (!data.name || !data.price) {
                    res.statusCode = 400;
                    return res.end(
                        JSON.stringify({error: "Name and Price are required"}));
                }
                const lastId = MENU.length > 0 ? MENU[MENU.length -
                1].id : 0;
                const nextId = lastId + 1;
                const dishToSave = {
                    id: nextId,
                    name: data.name,
                    category: data.category || "Інше",
                    price: data.price,
                    available: data.available !== undefined ?
                        data.available : true,
                };
                MENU.push(dishToSave);
                res.statusCode = 201;
                res.end(JSON.stringify({
                    message: "Created", dish:
                    dishToSave
                }));
            } catch (err) {
                res.statusCode = 400;
                res.end(JSON.stringify({error: "Invalid JSON"}));
            }
        });
        return;
    }

    // --- PATCH: Оновлення страви (наприклад, ціни) ---
    if (method === "PATCH" && pathname.startsWith("/menu/")) {
        const id = parseInt(pathname.split("/")[2]);
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            const index = MENU.findIndex((d) => d.id === id);
            if (index !== -1) {
                const updates = JSON.parse(body);
                MENU[index] = {...MENU[index], ...updates};
                res.statusCode = 200;
                res.end(JSON.stringify({
                    message: "Updated", dish:
                        MENU[index]
                }));
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({error: "Not Found"}));
            }
        });
        return;
    }

    // --- DELETE: Видалення страви ---
    if (method === "DELETE" && pathname.startsWith("/menu/")) {
        const id = parseInt(pathname.split("/")[2]);
        const originalLength = MENU.length;
        MENU = MENU.filter((dish) => dish.id !== id);
        if (MENU.length < originalLength) {
            res.statusCode = 200;
            res.end(JSON.stringify({message: "Deleted"}));
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({error: "Not Found"}));
        }
        return;
    }

    // 404
    res.statusCode = 404;
    res.end(JSON.stringify({error: "Route not found"}));
});

// Ми повинні вивести логи що сервер успішно запустився.
server.listen(PORT, HOSTNAME, () => {
    console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});