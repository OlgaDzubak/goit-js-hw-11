import axios from "axios";

export class PixabayAPI {

    // приватні властивості для запиту 
    #BASE_URL = 'https://pixabay.com/api/';
    #API_KEY = '35820860-09ae26b0f261a8f2213be3901';

    #image_type = "photo";
    #orientation = "horizontal";
    #safe_search = "true";
    #per_page = 20;
    #query = '';                                        
    
    getPhotoByQuery(page) {
        return axios.get(`${this.#BASE_URL}`, {
            params: {
                key: this.#API_KEY,
                q: this.#query,                       // запит користувача з форми пошуку
                image_type: this.#image_type,
                orientation: this.#orientation,
                safesearch: this.#safe_search,
                page,
                per_page: this.#per_page,
            }
        })
    };

    // сеттери
    set query(newQuery) {this.#query = newQuery;};
    set orientation(orient) {this.#orientation = orient;};
    set safe_search(safeMode) {this.#safe_search = safeMode;};
    set safe_search(safeMode) {this.#safe_search = safeMode;};
    set per_page(itemsPerPage) {this.#per_page = itemsPerPage;};

}