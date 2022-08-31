const playwright = require("playwright");
const fs = require("fs");
const download = require("image-downloader");

var allLinksJson = require("../links/links.json");

function setupCategory(categorie) {
  var dir = "./" + categorie + "/photos";

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeInFile(categorie, content) {
  fs.appendFile(categorie + "/" + categorie + ".csv", content, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Successfully written data to file");
  });
}

function downloadPicture(categorie, itemRef, pictureLink) {
  download
    .image({
      url: pictureLink,
      dest: "../../" + categorie + "/photos/" + itemRef + ".jpeg",
    })
    .then(({ filename }) => {
      console.log("Saved to", filename);
    })
    .catch((err) => console.error(err));
}

async function fetchOnePage(page, link, categorie) {
  await page.goto(link);

  // All Attributes to fetch
  const title = await page.locator("h1.text-dark").innerText();
  const ref = await page.locator("h1.sku").innerText();
  const price = await page.locator("span.price").innerText();
  const description = await page.locator("p.text-dark").innerText();
  const pictureLink = await page.locator("img.img-fluid").getAttribute("src");

  writeInFile(
    categorie,
    title + "\t" + ref + "\t" + price + "\t" + description + "\r\n"
  );
  downloadPicture(categorie, ref, pictureLink);
}

async function main() {
  const browser = await playwright.chromium.launch({
    headless: true, // set this to false,
  });

  const page = await browser.newPage();
  for (key in allLinksJson) {
    // Create folder
    setupCategory(key);
    for (link of allLinksJson[key]) {
      await fetchOnePage(page, link, key);

      console.log(
        key +
          " : " +
          (allLinksJson[key].indexOf(link) + 1) +
          "/" +
          allLinksJson[key].length
      );
    }
  }
  await browser.close();
}

main();
