const playwright = require("playwright");
const fs = require("fs");

// Login to the website if needed
async function login(page) {
  await page.goto("https://test.fr/connexion");

  // Fill [placeholder="Adresse email de connexion"]
  await page
    .locator('[placeholder="Adresse email de connexion"]')
    .fill("yourEmail@gmail.com");

  // Click [placeholder="Mot de passe"]
  await page.locator('[placeholder="Mot de passe"]').click();

  // Fill [placeholder="Mot de passe"]
  await page.locator('[placeholder="Mot de passe"]').fill("totodughetto");

  // Click text=IDENTIFICATION
  await page.locator("text=IDENTIFICATION").click();
}

// Should fill a json with all items links
async function main() {
  // Replace by appendFile if needed
  fs.writeFile("links.json", "{", (err) => {
    if (err) throw err;
  });

  const browser = await playwright.chromium.launch({
    headless: false, // set this to true,
  });

  // Categories to fetch links from
  const categoriesObject = [
    {
      name: "bracelets",
      link: "https://test.fr/categorie/bracelets",
      nbPageMax: 10,
    },
    {
      name: "pendentifs",
      link: "https://test.fr/categorie/pendentifs",
      nbPageMax: 4,
    },
    {
      name: "colliers",
      link: "https://test.fr/categorie/colliers",
      nbPageMax: 6,
    },
  ];

  const page = await browser.newPage();

  // Optional
  // await login(page);

  for (const categorie of categoriesObject) {
    let allLinks = [];
    await page.goto(categorie.link);

    for (let i = 1; i <= categorie.nbPageMax; i++) {
      await page.goto(categorie.link + "?page=" + i);

      // Get all the links from the page
      const links = await page.$$eval(".cat-title-product a", (el) => {
        return el.map((e) => e.href);
      });

      allLinks = allLinks.concat(links);
    }

    const finalObject = {
      [categorie.name]: allLinks,
    };

    let data = JSON.stringify(finalObject);
    fs.appendFile(
      "links.json",
      data.slice(1, data.length - 1) +
        (categorie.name !== categoriesObject[categoriesObject.length - 1]
          ? ","
          : ""),
      (err) => {
        if (err) throw err;
      }
    );

    // Timeout to avoid IP Ban
    await page.waitForTimeout(1000); // wait
  }
  await browser.close();
  fs.appendFile("links.json", "}", (err) => {
    if (err) throw err;
  });
}

main();
