fetch("./src/navbar.html")
    .then((response) => response.text())
    .then((data) => {
        document.getElementById("navbar-placeholder").innerHTML = data;
        const themeBtn = document.getElementById("theme-toggle");

        if (themeBtn) {
            const btnIcon = themeBtn.querySelector(".icon");

            themeBtn.addEventListener("click", () => {
                if (
                    document.documentElement.getAttribute("data-theme") ===
                    "dark"
                ) {
                    document.documentElement.removeAttribute("data-theme");
                } else {
                    document.documentElement.setAttribute("data-theme", "dark");
                }

                if (
                    document.documentElement.getAttribute("data-theme") ===
                    "dark"
                ) {
                    btnIcon.textContent = "☀️";
                } else {
                    btnIcon.textContent = "🌙";
                }
            });
        }
    });
