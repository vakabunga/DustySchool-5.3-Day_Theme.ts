const currentDate = new Date().toLocaleDateString();
localStorage.setItem('currentDate', currentDate);
const prevDate = localStorage.getItem(currentDate);
const app: HTMLBodyElement | null = document.querySelector('.app');

type ImageSource = {
    total: number;
    results: ImageSourceData[] | [];
};

type Urls = 'raw' | 'full' | 'regular' | 'small' | 'thumb' | 'small_s3';

type ImageSourceData = {
    urls: {
        [key in Urls]: string;
    };
};

if (prevDate === currentDate && localStorage.bgUrl) {
    const currentImageBackgroundUrl: string = localStorage.bgUrl;
    preloadContent(currentImageBackgroundUrl);
} else {
    getWordOfTheDay()
        .then((data) => {
            return getPhotoByTheWord(data.word);
        })
        .then((data: ImageSource) => {
            if (data.total > 0) {
                localStorage.setItem('bgUrl', data.results[0].urls.full);
                preloadContent(data.results[0].urls.full);
            } else {
                getRandomPhoto()
                    .then((data: ImageSourceData) => {
                        localStorage.setItem('bgUrl', data.urls.full);
                        preloadContent(data.urls.full);
                    });
            }
        });
}

function getWordOfTheDay() {
    return fetch(`https://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=${API_KEY_WORDNIK}`)
        .then((response) => response.json());
}

function getPhotoByTheWord(word: string) {
    return fetch(`https://api.unsplash.com/search/photos?client_id=${API_KEY_UNSPLASH}&query=${word}`)
        .then((response) => response.json());
}

function getRandomPhoto() {
    return fetch(`https://api.unsplash.com/photos/random?client_id=${API_KEY_UNSPLASH}`)
        .then((response) => response.json());
}

function preloadContent(url: string) {
    const preloadContainer = document.createElement('img');
    preloadContainer.classList.add('preload');
    preloadContainer.src = url;

    preloadContainer.addEventListener('load', () => {
        if (app) {
            app.style.backgroundImage = `url("${url}")`;
        }
    });
}
