// Listen for messages from the content script
document.addEventListener("DOMContentLoaded", function () {

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const activeTab = tabs[0];

        if (activeTab.url === "https://www.floatplane.com/channel/linustechtips/home")
        {
            document.getElementById("non_floatplane_container").style.display = "none";

            document.getElementById("clearFilter").addEventListener("click", function ()
            {
                chrome.tabs.sendMessage(activeTab.id, {
                    action: "clear_filter"
                })
            });

            (
                async () =>
                {
                    const response = await chrome.tabs.sendMessage(activeTab.id, {
                        action: "update_filter"
                    })
                    const element = document.getElementById("data")
                    element.innerHTML = "<ul>";
                    response.forEach(channel =>
                    {
                        return (
                            element.innerHTML += `<li class="filter" data-action="filter" data-short_name="${channel.short_name}" data-real_name="${channel.real_name}">${channel.real_name}</li>`
                        )
                    })
                    element.innerHTML += "</ul>";

                    const filterOptions = document.querySelectorAll("li[data-action='filter']");
                    filterOptions.forEach(option =>
                    {
                        option.addEventListener('click', async function ()
                        {
                            const short_name = this.getAttribute("data-short_name");

                            await chrome.tabs.sendMessage(activeTab.id, {
                                action: "perform_filter",
                                short_name: short_name
                            })

                        });
                    });
                }
            )()
        }
        else
        {
            document.getElementById("non_floatplane_container").style.display = "block";
            document.getElementById("floatplane_container").style.display = "none";
        }
    })
})