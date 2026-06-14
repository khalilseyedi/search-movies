const wrapper = document.querySelector('#wrapper');
const input = document.querySelector('#movie-name');
const emptyStatus = document.querySelector('.empty-status');
const modal = document.querySelector('.modal-filter');
const filterIcon = document.querySelector('.iconFilter');
const iconClose = document.querySelector('.iconClose');
const moviesCount = document.querySelector('.movies-count');
const moviesCounter = document.querySelector('.movies-counter');
const spansGenre = document.querySelectorAll('.modal-filter span');
const progressBar = document.querySelector('.progress-fill');
let allMovies = [];
let moviesData = [];
let currentQuery = "";
// search form
wrapper.addEventListener('submit', (e) => {
    e.preventDefault();

    const valueSearch = input.value.trim();
    if (!valueSearch) return;

    currentQuery = valueSearch;

    searchMovieFromApi(valueSearch)

});

// modal filter
filterIcon.addEventListener('click', () => {
    modal.classList.toggle('hidden');
    filterIcon.classList.toggle('color');
});

// get value inout icon
input.addEventListener('input', () => {
   if (input.value.trim().length < 0) {
        iconClose.classList.add('hidden');
   }else {
       iconClose.classList.remove('hidden');
   }
});

// close icon
iconClose.addEventListener('click', () => {
    const moviesGrid = document.querySelector('.movies-grid');

    input.value = '';
    iconClose.classList.add('hidden');

    currentQuery = "";
    allMovies = [];

    moviesGrid.innerText = '';
    moviesCounter.classList.add('hidden');
    emptyStatus.classList.remove('hidden');
});

// search from Api
async function searchMovieFromApi(query) {
    try {
        const apiUrl = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`;
        console.log(apiUrl);
        progressBar.style.width = '30%';
        const response = await fetch(apiUrl);
        progressBar.style.width = '70%';
        const data = await response.json();
        // console.log(data);

        if (query !== currentQuery) return;
        if (!data.Search) return;

        moviesCounter.classList.add('hidden');
        emptyStatus.classList.add('hidden');

        moviesCounter.classList.remove('hidden');
        const movies = data.Search;
        moviesCount.textContent = movies.length;

        displayCard(movies);
        progressBar.style.width = '100%';
        setTimeout(() => {
            progressBar.style.width = '0%';
        },500)

    } catch (error) {
        console.error(error);
    }
}

// get details film
async function getDetailsFilmFromApi(imdId) {
    try {
        const apiUrl = `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdId}`;
        const response = await fetch(apiUrl);
        const details = await response.json();

        console.log(details);
        return details;
    }catch (error) {
        console.error(error);
    }
}


// display card with Api
async function displayCard(movies) {
    const detailsArray = await Promise.all(
        movies.map(movie => getDetailsFilmFromApi(movie.imdbID))
    )
    moviesData = detailsArray;
    renderCards(detailsArray)

}
// display card
function renderCards(detailsArray) {
    const moviesGrid = document.querySelector('.movies-grid');
    moviesGrid.innerHTML = '';

    detailsArray.forEach((movie, index) => {
        const details = detailsArray[index];

        const divCard = document.createElement('div');
        divCard.innerHTML = `
            <div class="card" style="background-image: url(${movie.Poster || ''})">
            <div class="rating">
                 <i class="fa-solid fa-star star-top"></i>  
                 <span>${details.imdbRating}</span> 
            </div>
            <div class="movie-info">
                <div class="movie-title">
                    <span>${movie.Title}</span>
                </div>
                <div class="details">
                    <div class="movie-details">
                        <div class="film-calendar">
                            <i class="fa-regular fa-calendar"></i>
                            <span>${movie.Year}</span>
                        </div>
                        <div class="film-time">
                            <i class="fa-regular fa-clock"></i>
                            <span>${details.Runtime}</span>
                        </div>
                    </div>
                    <div class="movie-rating">
                        <i class="fa-solid fa-star star"></i>
                        <span>${details.imdbRating}</span>
                    </div>
                    <div class="genre">
                        ${details.Genre.split(', ').map(genre =>`<span>${genre}</span>`).join('')}</spa>
                    </div>
                   </div>
            </div>
        </div>
       `;
        moviesGrid.append(divCard)
    })
}

// filter
function filteredMovie(genre) {
    if (genre === "All"){
        renderCards(moviesData);
        moviesCount.textContent = moviesData.length;
        return
    }
    const filteredMovies = moviesData.filter((movie) => movie.Genre.includes(genre) );

    renderCards(filteredMovies);
    moviesCount.textContent = filteredMovies.length

}
// click Genre
spansGenre.forEach((genre) => {
    genre.addEventListener('click', () => {
        spansGenre.forEach((item) => {
            item.classList.remove('active');
        })
        genre.classList.add('active');
        const valueGenre = genre.textContent;
         filteredMovie(valueGenre)
    })
})
