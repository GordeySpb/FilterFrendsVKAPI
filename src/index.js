import render from './template/friend.hbs';

// кнопка сохранения

const save = document.getElementById('save-btn');

//левый инпут

const serchLeft = document.getElementById('serch-left');

//правый инпут 

const serchRight = document.getElementById('serch-right');

//левый лист

const listLeft = document.getElementById('list-left');

//правый лист

const listRight = document.getElementById('list-right');

const addBtn = document.querySelector('.item__btn--add');

//левый список друзей

let friendsLeft;

//правый список друзей

let friendsRight = [];





//инициализация приложения
VK.init({
    apiId: 6492796
});

//авторизация

const auth = () => {
    return new Promise((resolve, reject) => {
        VK.Auth.login(data => {
            if (data.session) {
                resolve()
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 2)
    });
};

const callAPI = (method, params) => {
    params.v = '5.78';

    return new Promise((resolve, reject) => {
        VK.api(method, params, (data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);
            }
        });
    });
};

//получение друзей из вк и отображение их на странице

(async () => {
    try {
        await auth();

        friendsLeft = await callAPI('friends.get', {
            fields: 'first_name, last_name, photo_100'
        });

        //сохраняем массив друзей
        let friendsLeftItems = friendsLeft.items;
        const html = render(friendsLeft);
        listLeft.innerHTML = html;

        listLeft.addEventListener('click', e => {
            e.preventDefault();

            if (!(e.target.classList.contains('ibtn__img'))) return

            //получение id текущего друга
            const friendId = e.target.getAttribute('data-id');






            addFriend(friendsLeftItems, friendId)
            console.log(friendsRight)
        })

    } catch (e) {
        console.error(e);
    }

})();

//проверка подстроки в строке

function isMatching(full, chunk) {
    full = full.toLowerCase();
    chunk = chunk.toLowerCase();


    if (full.indexOf(chunk) + 1) {
        return true
    } else {
        return false
    }

};

//добавление друга

function addFriend(friends, id) {
    friends.forEach(element => {
        if (element.id === id) {
            friendsRight.push(element)
        }
    });

};

