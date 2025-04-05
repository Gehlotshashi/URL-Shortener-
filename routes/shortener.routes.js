import { writeFile, readFile } from "fs/promises";
import crypto from "crypto";
import path from "path";
import { Router } from "express";

const router = Router();
const DATA_FILE = path.join("data", "links.json");

const serveFile = async (res, filepath, contenttype) => {
    try {
        const data = await readFile(filepath);
        res.writeHead(200, { "Content-Type": contenttype });
        res.end(data);
    } catch (error) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Page not found");
    }
};

const loadLinks = async () => {
    try {
        const data = await readFile(DATA_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {
            await writeFile(DATA_FILE, JSON.stringify({})); // Fixed writeFile usage
            return {};
        }
        throw error;
    }
};

const saveLinks = async (links) => {
    await writeFile(DATA_FILE, JSON.stringify(links)); // Correct usage
};

router.get("/", async (req, res) => {
    try {
        const file = await readFile(path.join("views", "index.html"));
        const links = await loadLinks();

        const content = file
            .toString()
            .replaceAll(
                "{{shortened_urls}}",
                Object.entries(links)
                    .map(
                        ([shortCode, url]) =>
                            `<li> <a href="/${shortCode}" target ="_blank" > ${req.host}/${shortCode}</a> -${url}</li>`
                    )
                    .join("")
            );

        res.send(content);
    } catch (e) {
        console.error(e);
        return res.status(500).send("Internal server Error ");
    }
});

router.post("/", async (req, res) => {
    try {
        const { url, shortCode } = req.body;
        const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

        const links = await loadLinks();

        if (links[finalShortCode]) {
            return res.status(400).send("Short code already exists. Please choose another");
        }

         links[finalShortCode] = url;
         await saveLinks(links);
        return res.redirect("/");
    } catch (error) {
        console.error(error);
        return res.status(500).send("Failed to save link");
    }
});

router.get("/:shortCode", async (req, res) => {
    try {
        const { shortCode } = req.params;
        const links = await loadLinks();

        if (!links[shortCode]) return res.status(404).send("404 error occurred");
        return res.redirect(links[shortCode]);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal server error");
    }
});

export const shortenedRoutes =router;