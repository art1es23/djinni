"use strict";
const loader = document.querySelector(".loader");

const showLoader = () => loader.classList.add("show");
const hideLoader = () => loader.classList.remove("show");

window.addEventListener("load", async (e) => {
  let currentPage = 1;
  const limit = 9;
  let total = 0;
  const pageInner = document.querySelector("#pageInner");
  const triggerFilters = document.querySelector(".filter-trigger");
  const tabsFilters = document.querySelector(".filter-tabs");

  window.addEventListener(
    "scroll",
    () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;

      if (
        scrollTop + clientHeight >= scrollHeight - 15 &&
        hasMoreItems(currentPage, limit, total)
      ) {
        currentPage++;
        loadItems(currentPage, limit, total, pageInner);
      }
    },
    { passive: true }
  );
  loadItems(currentPage, limit, total, pageInner);
  if (window.innerWidth <= 767) {
    handlerStateFilters(triggerFilters, tabsFilters);
  }
  window.addEventListener("resize", () => {
    if (window.innerWidth <= 767) {
      handlerStateFilters(triggerFilters, tabsFilters);
    } else {
      tabsFilters.classList.remove("filter-tabs--show");
      tabsFilters.classList.add("d-none");
      triggerFilters.classList.remove("filter-trigger--active");
    }
  });
});

async function loadItems(page, limit, total, pageInner) {
  showLoader();

  setTimeout(async () => {
    try {
      if (hasMoreItems(page, limit, total)) {
        const response = await GET_API_ITEMS(page, limit);
        createPages(pageInner, response);
        total = response.total;
      }
    } catch (error) {
      console.log(error);
    } finally {
      hideLoader();
    }
  }, 500);
}

function hasMoreItems(page, limit, total) {
  const startIndex = (page - 1) * limit + 1;
  return total === 0 || startIndex < total;
}

function GET_API_ITEMS(currentPage, limit) {
  const API_URL = `https://picsum.photos/v2/list?page=${currentPage}&limit=${limit}`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  };

  return getData(API_URL, options);
}

async function getData(url, options) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`An error occurred: ${response.status}`);
    }
    let data = await response.json();
    return data;
  } catch (error) {
    console.log("Error:", error);
    throw error;
  }
}

function createPages(parent, items) {
  items.forEach((item, idx) => {
    let description =
      idx % 2 == 0
        ? `Here goes some sample, example text that is relatively short.`
        : `Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae dolor perspiciatis unde, labore ad sint! Sapiente quia eveniet dicta vel? Voluptas beatae facere molestiae pariatur consectetur hic qui quam itaque?`;

    const el = document.createElement("div");

    el.classList.add(
      "d-flex",
      "flex-column",
      "p-0",
      "border",
      "rounded-2",
      "overflow-hidden",
      "item"
    );

    el.innerHTML = `
        <div class="img-wrapper">
            <img src="${item.download_url}" alt="${item.author}" />
        </div>

        <div class="item-info d-flex flex-column px-4 py-3 gap-1 align-items-start">
            <h3 class="item-title">${item.author}</h3>
            <p class="item-description mb-2">${description}</p>
        </div>

        <div class="d-flex gap-2 align-items-center justify-content-between justify-content-md-start mt-auto px-4 px-sm-2 px-lg-3 py-3 border-top">
            <button type="button" class="btn fw-bold button-active">Save to collection</button>
            <button type="button" class="btn fw-bold border-2 button-share">Share</button>
        </div>
        `;
    parent.append(el);

    const infoEl = el.querySelector(".item-info");
    const textEl = el.querySelector(".item-description");
    let numberOfLines = textEl.scrollHeight / textEl.clientHeight;

    if (numberOfLines > 2) {
      let readMoreButton = document.createElement("button");
      readMoreButton.innerText = "Show more...";
      readMoreButton.classList.add("read-more-button");
      readMoreButton.addEventListener("click", () => {
        textEl.style.maxHeight = "none";
        textEl.style.overflow = "visible";
        readMoreButton.style.display = "none";
      });
      infoEl.append(readMoreButton);
    }
  });
}

function handlerStateFilters(trigger, modal) {
  trigger.addEventListener("click", (evt) => {
    modal.classList.toggle("filter-tabs--show");
    modal.classList.toggle("d-none");
    evt.currentTarget.classList.toggle("filter-trigger--active");
  });
}
