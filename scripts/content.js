/**
 * Mapping of short name listed on site, mapped to the full channel name to be
 * displayed on the filter
 * @type {[{short_name: string, real_name: string},{short_name: string, real_name: string},{short_name: string, real_name: string},{short_name: string, real_name: string},{short_name: string, real_name: string},null,null]}
 */
const channelMapping = [
    {
        "short_name": "LTT",
        "real_name": "Linus Tech Tips",
    },
    {
        "short_name": "TL",
        "real_name": "Tech Linked"
    },
    {
        "short_name": "SC",
        "real_name": "Short Circuit"
    },
    {
        "short_name": "FP Exclusive",
        "real_name": "Floatplane"
    },
    {
        "short_name": "TQ",
        "real_name": "Tech Quickie"
    },
    {
        "short_name": "MA",
        "real_name": "MAC Address"
    },
    {
        "short_name": "CSF",
        "real_name": "Channel Super Fun"
    }
]


let current_filter_short_name = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //When reveived, updates a list of the available channels from the main site
    if (request.action === "update_filter") {
        const channels = loadAvailableChannels();
        sendResponse(channels.sort((a, b) => {
            return a.real_name.localeCompare(b.real_name);
        }));
        return true;
    }
    //Performs the filter based on what was selected
    else if (request.action === "perform_filter")
    {
        removeFiltered(request.short_name);
        return false;
    }
    //Remove the filter and restore all of the videos in the list
    else if (request.action === "clear_filter")
    {
        current_filter_short_name = null;
        const elements = document.querySelectorAll("div.ReactElementGridItem");
        elements.forEach(element => {
            element.style.display = "inline-block"
        })
    }

});

/**
 * An oberserver to identify whe nthe DOM is updated
 * The page seems to expect a certain number of videos to be displayed
 * so when removed, the page auto reloads more in. When the DOM change
 * is detected the filtering is executed to remove all loaded in videos
 * that don't match the current filter
 * @type {MutationObserver}
 */
const observers = new MutationObserver(mutations => {
    for (let mutation of mutations) {
        if (mutation.target.nodeName === "DIV")
        {
            //loadAvailableChannels();
            if (current_filter_short_name !== null)
            {
                removeFiltered(current_filter_short_name)
            }

        }
    }
})
observers.observe(document, {childList: true, subtree: true});

/**
 * Loops through all of the videos on the site, and identifies
 * which channels are available and loads them into the filter
 * @returns {*[]}
 */
const loadAvailableChannels = () => {
    //Find all the div's that have a title attribute - this is the
    //title of the video
    const titleDivs = document.querySelectorAll("div[title]");
    const availableChannels = [];
    //Loop over each container looking for the shortname and adding the available
    //channel into the availableChannel list
    titleDivs.forEach(titleDiv => {
        const title = titleDiv.getAttribute("title");

        //Most videos are in the format of channel: Video title, where channel
        //is the short title, e.g. TQ = Tech Quickie
        if (title.indexOf(":") >= 0)
        {
            const short_channel_name = title.substring(0, title.indexOf(":"));
            const channel_mapping = channelMapping.find(c => c.short_name === short_channel_name);
            if (channel_mapping !== null && typeof channel_mapping !== typeof undefined)
            {
                //console.log("Channel is: " + channel_mapping.real_name);
                if (availableChannels.filter(c => c.short_name === channel_mapping.short_name).length === 0)
                {
                    availableChannels.push(channel_mapping);
                }
            }
        }
        //Video titles without the : are assumed to be LTT channel videos
        else
        {
            if (availableChannels.filter(c => c.real_name === "Linus Tech Tips").length === 0)
            {
                availableChannels.push({
                    short_name: "",
                    real_name: "Linus Tech Tips"
                })
            }
        }

    })
    return availableChannels;
}

/**
 * Remove the videos that aren't being filtered
 * They are only hidden from the DOM so they can be
 * re-shown without requiring the page to be re-loaded
 * @param short_name
 */
const removeFiltered = (short_name) => {
    if (short_name !== null)
    {
        //Ensure the current filter is remembered
        current_filter_short_name = short_name;
        //Loop over all of the div's with the title attribute
        //and remove them from the DOM if it doesn't match the
        //current filter
        const titleDivs = document.querySelectorAll("div[title]");
        titleDivs.forEach(titleDiv =>
        {
            //If the title name starts with the short name
            if (short_name !== "")
            {
                if (!titleDiv.getAttribute("title").startsWith(`${short_name}:`))
                {
                    const container = titleDiv.closest("div.ReactElementGridItem");
                    container.style.display = "none";
                }
            }
            else
            {
                if (titleDiv.getAttribute("title").indexOf(":") >= 0)
                {
                    const container = titleDiv.closest("div.ReactElementGridItem");
                    container.style.display = "none";
                }
            }
        })
    }
}
