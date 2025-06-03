const currentDate = new Date().toLocaleDateString();
localStorage.setItem('currentDate', currentDate);
const prevDate = localStorage.getItem(currentDate);
const app: HTMLBodyElement | null = document.querySelector('.app');
const wordOfTheDay = document.querySelector('.word-of-the-day');
const themeOfTheDay = document.querySelector('.theme-of-the-day');
const imageOfTheDayText = 'The background picture was found by word of the day';
const imageRandomText = 'Unfortunately, we were unable to find an image based on the word of the day, so you just see a random picture in the background.';

type Definition = {
    text: string;
  };

type WordnikResponse = {
  word: string;
  definitions: Definition[];
};

type UnsplashSearchImageResponse = {
  total: number;
  results: UnsplashRandomResponse[] | [];
};

type Urls = 'raw' | 'full' | 'regular' | 'small' | 'thumb' | 'small_s3';

type UnsplashRandomResponse = {
  id: string,
  alt_description: string,
  urls: {
    [key in Urls]: string;
  };
};

if (prevDate === currentDate && localStorage.bgUrl) {
  const currentImageBackgroundUrl: string = localStorage.bgUrl;

  if (wordOfTheDay && themeOfTheDay) {
    wordOfTheDay.textContent = `Word of the day is ${localStorage.wordOfTheDay}`;
    themeOfTheDay.textContent = localStorage.imageOfTheDay == 'true' ? imageOfTheDayText : imageRandomText;
  }

  preloadContent(currentImageBackgroundUrl);
} else {
  getWordOfTheDay()
    .then((data: WordnikResponse) => {
      if (wordOfTheDay) {
        wordOfTheDay.textContent = `Word of the day is ${data.word}`
      }

      localStorage.setItem('wordOfTheDay', data.word);
      return getPhotoByTheWord(data.word);
    })
    .then((data: UnsplashSearchImageResponse) => {
      if (data.total > 0) {
        localStorage.setItem('imageOfTheDay', 'true');
        localStorage.setItem('bgUrl', data.results[0].urls.full);
        preloadContent(data.results[0].urls.full);
        
        if (themeOfTheDay) {
            themeOfTheDay.textContent = imageOfTheDayText;
        }
      } else {
        getRandomPhoto()
          .then((data: UnsplashRandomResponse) => {
            localStorage.setItem('imageOfTheDay', 'false');
            localStorage.setItem('bgUrl', data.urls.full);
            preloadContent(data.urls.full);

            if (themeOfTheDay) {
                themeOfTheDay.textContent = imageRandomText;
            }
          });
      }
    });
}

function getWordOfTheDay(): Promise<WordnikResponse> {
  return fetch(`https://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=${API_KEY_WORDNIK}`)
    .then((response) => response.json());
}

function getPhotoByTheWord(word: string): Promise<UnsplashSearchImageResponse> {
  return fetch(`https://api.unsplash.com/search/photos?client_id=${API_KEY_UNSPLASH}&query=${word}`)
    .then((response) => response.json());
}

function getRandomPhoto(): Promise<UnsplashRandomResponse> {
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
