
"use strict";

document.addEventListener("DOMContentLoaded", function () {
    initReportNavigation();
    initActiveSection();
    initAccountFilters();
    initDetailLinks();
    initPrintActions();
    initImageFallback();
    initKeyboardControls();
    initReportState();
});


/* Report Navigation */
function initReportNavigation() {
    const navigation = document.querySelector(".report-navigation");

    if (!navigation) return;

    const links = navigation.querySelectorAll('a[href^="#"]');

    links.forEach(function (link) {
        link.addEventListener("click", function (event) {
            const targetId = link.getAttribute("href");
            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
                block: "start"
            });

            links.forEach(function (item) {
                item.classList.remove("active");
                item.removeAttribute("aria-current");
            });

            link.classList.add("active");
            link.setAttribute("aria-current", "location");

            if (history.replaceState) {
                history.replaceState(null, "", targetId);
            }
        });
    });
}


/* Active Section Tracking */
function initActiveSection() {
    const navigation = document.querySelector(".report-navigation");

    if (!navigation || !("IntersectionObserver" in window)) return;

    const links = Array.from(
        navigation.querySelectorAll('a[href^="#"]')
    );

    const sections = links
        .map(function (link) {
            return document.querySelector(link.getAttribute("href"));
        })
        .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(function (entries) {
        const visibleSections = entries
            .filter(function (entry) {
                return entry.isIntersecting;
            })
            .sort(function (a, b) {
                return b.intersectionRatio - a.intersectionRatio;
            });

        if (!visibleSections.length) return;

        const currentId = visibleSections[0].target.id;

        links.forEach(function (link) {
            const isActive =
                link.getAttribute("href") === "#" + currentId;

            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }, {
        rootMargin: "-15% 0px -65% 0px",
        threshold: [0, 0.15, 0.35, 0.6]
    });

    sections.forEach(function (section) {
        observer.observe(section);
    });
}


/* Account Filters */
function initAccountFilters() {
    const filterContainer = document.querySelector(".account-filter");
    const table = document.querySelector(".account-table");

    if (!filterContainer || !table) return;

    const filters = filterContainer.querySelectorAll("a");
    const rows = table.querySelectorAll("tbody tr");

    filters.forEach(function (filter) {
        filter.addEventListener("click", function (event) {
            event.preventDefault();

            const label = filter.textContent.trim().toLowerCase();
            const filterValue =
                filter.dataset.filter ||
                (label.includes("open")
                    ? "open"
                    : label.includes("closed")
                        ? "closed"
                        : "all");

            filters.forEach(function (item) {
                item.classList.remove("active");
                item.removeAttribute("aria-current");
            });

            filter.classList.add("active");
            filter.setAttribute("aria-current", "true");

            rows.forEach(function (row) {
                const statusElement = row.querySelector(".status");
                const statusText = statusElement
                    ? statusElement.textContent.trim().toLowerCase()
                    : "";

                const matches =
                    filterValue === "all" ||
                    statusText === filterValue ||
                    row.dataset.status === filterValue;

                row.hidden = !matches;
            });
        });
    });
}


/* Detail Links */
function initDetailLinks() {
    const detailLinks = document.querySelectorAll(
        '[data-report-action="details"]'
    );

    detailLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            const targetSelector = link.dataset.target;
            const target = targetSelector
                ? document.querySelector(targetSelector)
                : document.querySelector("#credit-score-details");

            if (target) {
                event.preventDefault();

                target.hidden = false;
                target.scrollIntoView({
                    behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches ? "auto" : "smooth",
                    block: "center"
                });

                const closeButton = target.querySelector(
                    '[data-report-action="close-details"]'
                );

                if (closeButton) closeButton.focus();
            }
        });
    });

    const closeLinks = document.querySelectorAll(
        '[data-report-action="close-details"]'
    );

    closeLinks.forEach(function (button) {
        button.addEventListener("click", function () {
            const container = button.closest(
                "#credit-score-details, [data-report-details]"
            );

            if (container) {
                container.hidden = true;

                const trigger = document.querySelector(
                    '[data-report-action="details"]'
                );

                if (trigger) trigger.focus();
            }
        });
    });
}


/* Print Report */
function initPrintActions() {
    const printButtons = document.querySelectorAll(
        '[data-report-action="print"]'
    );

    printButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            window.print();
        });
    });

    window.addEventListener("beforeprint", function () {
        document.body.classList.add("report-printing");
    });

    window.addEventListener("afterprint", function () {
        document.body.classList.remove("report-printing");
    });
}


/* Image Fallback */
function initImageFallback() {
    const images = document.querySelectorAll("img");

    images.forEach(function (img) {
        img.addEventListener("error", function () {
            if (img.dataset.fallbackApplied === "true") return;

            img.dataset.fallbackApplied = "true";

            const fallback = img.dataset.fallback;

            if (fallback) {
                img.src = fallback;
            } else {
                img.classList.add("image-unavailable");
                img.hidden = true;
            }
        });
    });
}


/* Keyboard Controls */
function initKeyboardControls() {
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            const visibleDetails = document.querySelectorAll(
                '#credit-score-details:not([hidden]), ' +
                '[data-report-details]:not([hidden])'
            );

            visibleDetails.forEach(function (details) {
                details.hidden = true;
            });
        }

        if (
            event.key === "Home" &&
            !isTypingTarget(event.target)
        ) {
            window.scrollTo({
                top: 0,
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches ? "auto" : "smooth"
            });
        }

        if (
            event.key === "End" &&
            !isTypingTarget(event.target)
        ) {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches ? "auto" : "smooth"
            });
        }
    });
}

function isTypingTarget(target) {
    return target.matches(
        "input, textarea, select, [contenteditable='true']"
    );
}


/* Report Page State */
function initReportState() {
    const currentPage = window.location.pathname;

    document.documentElement.dataset.reportPage =
        currentPage.toLowerCase().includes("page-2") ||
        currentPage.toLowerCase().includes("report-2")
            ? "second"
            : "first";

    const currentYear = document.querySelectorAll(
        "[data-current-year]"
    );

    currentYear.forEach(function (element) {
        element.textContent = new Date().getFullYear();
    });
}