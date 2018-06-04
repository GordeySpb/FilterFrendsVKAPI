import render from './template/friend.hbs';

// кнопка сохранения

const save = document.getElementById('save-btn');

//левый лист

const listLeft = document.getElementById('list-left');

//список с друзьями

const listFriends = document.querySelector('.frends__row');

//правый лист

const listRight = document.getElementById('list-right');

const inputs = document.querySelector('.serch__row');

//левый список друзей

let friendsLeft;

//правый список друзей

let friendsRight = [];

let friendsLeftItems = [];

let currentDrag;


//инициализация приложения
VK.init({
    apiId: 6497221
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
        friendsLeftItems = friendsLeft.items;
        const html = render(friendsLeft);
        listLeft.innerHTML = html;

        if (localStorage.left || localStorage.right) {

            let left = JSON.parse(localStorage.left);
            let right = JSON.parse(localStorage.right);


            listLeft.innerHTML = render(left);
            listRight.innerHTML = render({
                items: right,
                selected: true
            });
        }

        listFriends.addEventListener('click', e => {
            e.preventDefault();


            //получение id текущего друга
            const friendId = e.target.getAttribute('data-id');

            if (e.target.classList.contains('ibtn__img--add')) {

                const rightInput = document.getElementById('serch-right');
                const rightInputValue = rightInput.value;
                //добавление выбранных друзей в массив
                addFriend(friendsLeftItems,friendsRight, friendId);

                if (rightInputValue === '') {
                    listRight.innerHTML = render({
                        items: friendsRight,
                        selected: true
                    });
                } else {
                    let sortArrFriendRight = sortName(friendsRight, rightInputValue);
                    listRight.innerHTML = render({
                        items: sortArrFriendRight,
                        selected: true
                    });

                }
                //рендеринг левого списка
                listLeft.innerHTML = render(friendsLeft);

            }


            if (e.target.classList.contains('ibtn__img--delete')) {
                let leftInput = document.getElementById('serch-left');
                let leftInputValue = leftInput.value;

                //удаление друга
                deleteFrendFromList(friendsRight, friendId);

                if (leftInputValue === '') {
                    //рендеринг левого списка
                    listLeft.innerHTML = render({
                        items: friendsLeftItems
                    });
                } else {
                    let sortArrFriendsLeft = sortName(friendsLeftItems, leftInputValue);

                    //рендеринг правого списка
                    listLeft.innerHTML = render({
                        items: sortArrFriendsLeft,
                    });
                }

                listRight.innerHTML = render({
                    items: friendsRight,
                    selected: true
                });

            }

        });



        inputs.addEventListener('keyup', e => {
            e.preventDefault()

            if (e.target.classList.contains('serch-input--left')) {
                //значение с импута
                const inputValue = e.target.value;
                //отсортированный список
                let sortArrFriendLeft = sortName(friendsLeftItems, inputValue)

                //отображение отсортированных друзей в левом списке
                listLeft.innerHTML = render({
                    items: sortArrFriendLeft
                });

            }

            if (e.target.classList.contains('serch-input--right')) {
                //значение с импута
                const inputValue = e.target.value;
                //отсортированный список
                let sortArrFriendRight = sortName(friendsRight, inputValue)

                //отображение отсортированных друзей в левом списке
                listRight.innerHTML = render({
                    items: sortArrFriendRight,
                    selected: true
                });
            }

        })


        save.addEventListener('click', e => {
            e.preventDefault();

            saveToLocalStorage(friendsLeft, friendsRight)
        })

        //DnD

        listFriends.addEventListener('click', e => {
            if (e.target.classList.contains('list__item')) {
                const zone = getCurrentZone(e.target);
            }
        });

        listFriends.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') return

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('Text', e.target.getAttribute('data-id'));

            const zone = getCurrentZone(e.target);

            if (zone) {
                currentDrag = {
                    startZone: zone,
                    node: e.target
                };
            }
        });

        listFriends.addEventListener('dragover', (e) => {
            const zone = getCurrentZone(e.target);

            if (zone) {
                e.preventDefault();
            }
        });

        listFriends.addEventListener('drop', (e) => {
            let friendId = e.dataTransfer.getData('Text');

            if (currentDrag) {
                const zone = getCurrentZone(e.target);

                e.preventDefault();

                if (zone && currentDrag.startZone !== zone) {
                    if (currentDrag.startZone.id === 'list-left') {
                        // if (e.target.classList.contains('list__item')) {
                        //     zone.insertBefore(currentDrag.node, e.target.nextElementSibling);

                        // } else {
                        //     zone.insertBefore(currentDrag.node, zone.lastElementChild);
                        // }


                        addFriend(friendsLeftItems,friendsRight, friendId);

                    }

                    if (currentDrag.startZone.id === 'list-right') {
                        addFriend(friendsRight,friendsLeftItems, friendId)
                    }




                    listRight.innerHTML = render({
                        items: friendsRight,
                        selected: true
                    });


                    listLeft.innerHTML = render({
                        items: friendsLeftItems
                    });

                }


                currentDrag = null;
            }

        });

    } catch (e) {
        console.error(e);
    }

})();

//проверка подстроки в строке

function isMatching(full, chunk) {
    full = full.toLowerCase();
    chunk = chunk.toLowerCase();

    return (full.indexOf(chunk) + 1) ? true : false
};

function sortName(array, val) {
    let sortsArr = [];

    array.forEach(elem => {
        //получение полного имени
        const fullName = `${elem.first_name} ${elem.last_name}`;

        if (isMatching(fullName, val)) {
            sortsArr.push(elem);
        }
    })

    return sortsArr;

};

//добавление друга в правый лист и удаление из левого

function addFriend(from, to,  id) {

    from.forEach(element => {

        if (element.id === Number(id)) {
            to.push(element)

            let elementIndex = from.indexOf(element);
            let removedFriends = from.splice(elementIndex, 1)

        };

    });

};

// function addFriendRight(friends, id) {

//     friends.forEach(element => {

//         if (element.id === Number(id)) {
//             friendsLeftItems.push(element)

//             let elementIndex = friends.indexOf(element);
//             let removedFriends = friends.splice(elementIndex, 1)

//         };

//     });

// };



//удаление друга из списка

function deleteFrendFromList(friends, id) {

    friends.forEach(element => {
        if (element.id === Number(id)) {
            friendsLeftItems.push(element);
            let elementIndex = friends.indexOf(element);

            //удаленный друг
            let removedFriends = friends.splice(elementIndex, 1)
        }

    })
};

function saveToLocalStorage(left, right) {
    localStorage.left = JSON.stringify(left);
    localStorage.right = JSON.stringify(right);

    alert('Друзья сохранены');
};



function getCurrentZone(from) {
    do {
        if (from.classList.contains('list')) {
            return from;
        }
    } while (from = from.parentElement);

    return null;
}