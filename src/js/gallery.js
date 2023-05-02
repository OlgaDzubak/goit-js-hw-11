
import createGalleryCards from "../tamplates/gallery-card.hbs";
import Axios from "axios";
import { Report } from 'notiflix/build/notiflix-report-aio';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { PixabayAPI } from "./pixabayAPI";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

// посилання на елементи документа
const gallery = document.querySelector(".gallery");
const searchForm = document.querySelector('#search-form');
const paginationButton = document.querySelector('.load-more-btn');

// налаштування options - тут будемо зберігати інформацію для пагінації сторінок
const options = {   
    totalItems: 0,                   // загальна кількість картинок, отриманих по запиту 
    itemsPerPage: 40,                // кількість картинок на одній сторінці, задаємл власноруч згідно із ДЗ
    totalPages: 0,                   // кількість сторінок, буде вираховуватись як Math.round(totalItems/itemsPerPage) після запита
    currentPage: 1,                  // номер початкової сторінки
}

const pixabayAPI = new PixabayAPI();
pixabayAPI.per_page = options.itemsPerPage;

let smleLightBox = new SimpleLightbox('div.gallery a', {captionsData: 'alt', captionDelay: 0});

//Вішаємо слухач на форму пошуку
searchForm.addEventListener('submit', clickSearchButton);
async function clickSearchButton(event){

    event.preventDefault();                                                                             

    gallery.innerHTML = "";                                                                                 // Спустошуємо галерею одразу після натискання кнопки пошуку
    paginationButton.classList.add("is-hidden");                                                            // Ховаємо кнопку пагінації
    options.currentPage = 1;                                                                                // Встановлюємо початкову сторінку галереї 

    // Забираємо фразу запиту (searchQuery) з input, форматуємо її (видаляємо всі зайві пробіли та ставимо замісь пробілів плюси) 
    // та відправляємо в pixabayAPI
    const searchQuery = event.currentTarget.elements["searchQuery"].value.replace(/(#[\wа-яё]+)/gi, '').replace(/[ ]+/g, ' ').trim().split(" ").join('+');  
    pixabayAPI.query = searchQuery;
    
    // Виводимо повідомлення, якщо фраза пуста і виходимо з функції
    if (!searchQuery){
        return Report.warning('Empty request!!!', 'Enter keywords for the images you want to find.');
    }
    
    // Промуємо робити html-запит
    try {
        const response = await pixabayAPI.getPhotoByQuery(options.currentPage);

        //Якщо ми отримали на запит пустий масив даних (нічого не знайдено), виводимо повідомлення і виходимо з функції
        if (response.data.hits.length === 0){
            return Report.failure('Search error!', '"Sorry, there are no images matching your search query. Please try again."');
        }
        
        //Заповнюємо об'єкт option новими данними (врахуємо те, що pixabayAPI лімітує повернення данних по запиту не більше ніж 500 елементів)
        options.totalItems = response.data.total > 500 ? 500 : response.data.total;
        options.totalPages = Math.round(options.totalItems/options.itemsPerPage);  // вираховуємо кількість сторінок

        // При рендері першої сторінки виводимо у консоль загальну кількість елементів галереї та кількість на одній сторінці
        if (options.currentPage === 1 ) {
            console.log("_________________________");
            console.log(`total photos = ${options.totalItems}`);
            console.log(`total photos per page = ${options.itemsPerPage}`);
            console.log(`total pages  = ${options.totalPages}`);
        }
        console.log(`Current page = ${options.currentPage}`);                           // виводимо у консоль поточну сторінку
        Notify.success(`Hooray!, '"We found for you ${options.totalItems} images.`);    // виводимо повідомлення про кількість знайдених картинок


        if (options.totalPages > 1) { paginationButton.classList.remove('is-hidden'); } // показуємо кнопку пагінації, якщо кількість сторінок більше одниєї
        gallery.innerHTML = createGalleryCards(response.data.hits);                     // рендеримо сторінку
        smleLightBox.refresh();                                                         // оновлюємо simplelightBox

    } catch(error) {                             //якщо запит повернув помилку, обровляємо її (виводимо у консоль)
        console.log(error);
    }
}

//Вішаємо слухач на кнопку пагінації
paginationButton.addEventListener('click', clickPaginationButton);
async function clickPaginationButton() {
    try {
       options.currentPage+=1;                                                             // збільшуємо лічільник currentPage на 1

       if (options.currentPage > options.totalPages){                                      // виводимо повідомлення якщо дійшли до кінця галереї і виходимо з функції
        return Report.failure("Oops!","We're sorry, but you've reached the end of search results.");
       }

       const respons = await pixabayAPI.getPhotoByQuery(options.currentPage);              // робимо http-запит на отримання нової сторінки даних
       console.log(`Current page = ${options.currentPage}`);                               // виводимо у консоль номер поточної сторінки
       gallery.innerHTML += createGalleryCards(respons.data.hits);                         // рендеримо сторінку
       smleLightBox.refresh();                                                             // оновлюємо simplelightBox

        // Робимо Scroll на початок нової сторінки після її завантаження 
        const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
        window.scrollBy({top: cardHeight * 2, behavior: "smooth",});

   } catch(error) {                                                                        //якщо запит повернув помилку, обровляємо її (виводимо у консоль)
       console.log(error);
   }
};