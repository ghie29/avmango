export const categories = {
    korean: {
        type: "supabase",
        slug: "korean",
        label: "Korean",
        showAd: false,
        ads: []
    },
    censored: {
        type: "api",
        url: "https://avdbapi.com/api.php/provide/vod?ac=detail&t=1",
        label: "Censored",
        showAd: true,
        ads: [
            { image: "https://ggonggane.com/storage/banner-image/20241018-1729178186610724.jpg", link: "https://t.me/csghie29" },
            { image: "https://ggonggane.com/storage/banner-image/20241018-1729178186610724.jpg", link: "https://t.me/csghie29" },
            { image: "https://ggonggane.com/storage/banner-image/20250530-1748596600489363.jpg", link: "https://t.me/csghie29" },
            { image: "https://ggonggane.com/storage/banner-image/20250530-1748596600489363.jpg", link: "https://t.me/csghie29" },
        ]
    },
    uncensored: {
        type: "api",
        url: "https://avdbapi.com/api.php/provide/vod?ac=detail&t=2",
        label: "Uncensored",
        showAd: false,
        ads: []
    },
    "uncensored-leaked": {
        type: "api",
        url: "https://avdbapi.com/api.php/provide/vod?ac=detail&t=3",
        label: "Uncensored Leaked",
        showAd: false,
        ads: []
    },
    amateur: {
        type: "api",
        url: "https://avdbapi.com/api.php/provide/vod?ac=detail&t=4",
        label: "Amateur",
        showAd: false,
        ads: []
    },
    "chinese-av": {
        type: "api",
        url: "https://avdbapi.com/api.php/provide/vod?ac=detail&t=5",
        label: "Chinese AV",
        showAd: false,
        ads: []
    },
    "english-subtitle": {
        type: "api",
        url: "https://avdbapi.com/api.php/provide/vod?ac=detail&t=7",
        label: "English Subtitle",
        showAd: false,
        ads: []
    },
};
