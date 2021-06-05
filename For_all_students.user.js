// ==UserScript==
// @name         For_all_students
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Назначает комиссию всей группе
// @author       You
// @match        https://up.tsu.tula.ru:6443/nagruzka/TeacherLoad/JSPForms/MainTeacherForm.jsp
// @icon         https://www.google.com/s2/favicons?domain=tula.ru
// @grant        none
// @require https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

function set_committee(mutations, observer) {
    for(const mutation of mutations) {
        // Изменены атрибуты
        if (mutation.type == "attributes") {
            console.log("attributes changed");
            // Изменился атрибут "value" - комиссия была изменена
            if (mutation.attributeName == "value" ) {
                // проставляет комиссию всем студентам
                console.log("проставляет комиссию всем студентам");
                // остановить наблюдение за атрибутом
                observer.disconnect();
                // для HTTP-запроса для сохранения изменений
                // Build formData object.
                let formData = new URLSearchParams();
                formData.set("typeload", "SaveTheme");
                formData.set("ParA", document.getElementById("sendParP").getAttribute("value"));
                formData.set("user", document.getElementById("idStr1").getAttribute("value"));
                formData.set("ParAU", document.getElementById("idStrP").getAttribute("value"));
                // число строк в таблице
                let lines = document.getElementById('tblContentsThemeStudent').tBodies[0].rows.length;
                // по всем студентам
                for(var student_N=1; student_N<lines; student_N++) {
                    // Котолупов в 620171
                    //for(let student_N=16; student_N<17; student_N++) {
                    // строка таблицы
                    console.log(student_N);
                    let row = document.getElementById('tblContentsThemeStudent').tBodies[0].rows[student_N];
                    // записать в поле UUID студента
                    formData.set("UUID_STUDENT", row.childNodes[0].title);
                    console.log(row.childNodes[0].title + ", " + row.childNodes[1].title);
                    // идентификатор преподавателя добавить в поле
                    formData.set("UUID_TEACHER", row.childNodes[4].title);
                    console.log(row.childNodes[5].title + ", " + row.childNodes[4].title);
                    // тема ВКР
                    console.log(row.childNodes[3].title);
                    formData.set("THEME", row.childNodes[3].title);
                    // ГЭК
                    formData.set("EX_COM_UUID", document.getElementById("idWETKomisID").value);
                    // сохранить изменения
                    fetch('https://up.tsu.tula.ru:6443/nagruzka/ThemeTblJR',
                          {method: 'POST',
                           body: formData
                          }
                         ).then(response => response.json()
                               ).then(commits => {
                        console.log("Результат назначения ГЭК: " + commits.res);
                        /*
                            if (commits.res) {
                                window.success++;
                            } else {
                                window.fail++;
                            }*/
                    });
                };
                // оповестить пользователя
                alert("ГЭК назначен всей группе. Назначение будет видно после обновления списка тем ВКР вручную.");
                /*
                    // обновить данные в таблице тем
                    let data = new URLSearchParams();
                    // данные POST
                    data.set("typeload", "ListThemeStudent");
                    data.set("_search", "false");
                    data.set("nd", "1622848997030");
                    data.set("rows", "auto");
                    data.set("page", "1");
                    data.set("sidx", "NAME");
                    data.set("sord", "asc");
                    // строка группы
                    let group = document.getElementsByClassName("ui-widget-content jqgrow ui-row-ltr ui-state-highlight")[0];
                    // GROUP_UUID
                    data.set("GROUP_UUID",group.childNodes[0].title);
                    // OSKO
                    data.set("OKSO", group.childNodes[2].title);
                    // COURSE
                    data.set("COURSE", group.childNodes[3].title);
                    //
                    */

            }
        }
    };
}

// выбор комиссии
function committee(input, e) {
    // чтение идентификатора из первой строки таблицы со студентами
    var student_uuid = document.getElementById('tblContentsThemeStudent').tBodies[0].rows[1].childNodes[0].title;
    // Записать это значение в поле студента
    var student = document.getElementById("idStudent");
    // записать в поле
    student.setAttribute("value", student_uuid);
    console.log("Студент для выбора комиссии " + student_uuid);
    // Создаём экземпляр наблюдателя с указанной функцией колбэка
    var observer = new MutationObserver(set_committee);
    // Начинаем наблюдение за аттрибутом  "value" целевого элемента
    observer.observe(input, {
        attributeFilter:[ "value" ] //configure it to listen to attribute "value" changes
    });
    // скопировано из Нагрузки
    e.preventDefault();
    ClickBTNShowWinSelectKomis();
};

// добавляет кнопку рядом с другими кнопками
function add_button() {
    'use strict';
    console.log("Их бин добавлять кнопка!");
    // Найти панель
    var panel = document.getElementById('idThemeGroupBTNPanel');
    // добавить кнопку на панель
    var new_button = panel.insertBefore(document.createElement("div"), panel.lastElementChild);
    // задать класс и id
    new_button.className = 'clBTNSThemeGroup';
    new_button.id = 'idBTNProtocol4all';
    // текст на кнопке
    new_button.textContent="Комиссия всей группе";
    // скрытые поля для данных на кнопке
    for (var field of ["idStudent", "idACTeacherValueTheme", "idWETKomisID"]) {
        // создать input
        var input = document.createElement("input");
        // задать id
        input.id = field;
        // сделать его скрытым
        input.setAttribute("type", "hidden");
        // добавить на кнопку
        new_button.appendChild(input);
    }
    // на нажатие кнопки выбор комиссии
    new_button.addEventListener("click", (function(e) {
        // проверка, что таблица загрузилась или в ней есть хоть один студент
        if (document.getElementById('tblContentsThemeStudent').tBodies[0].rows.length > 1) {
            // выбирать комиссию
            committee(input, e);
        } else { // рано работать
            alert("Таблица еще загрузилась или в ней нет ни одного студента");
        }
    }));
};

// ================= ГОЛОВНАЯ ПРОГРАММА ===================================================
console.log("Запуск скрипта");
// ждать появления таблицы студентов с темами ВКР
waitForKeyElements('div#idThemeDip.clTaskIGA div.col3_2 div#cntTBLThemeStudentJR div#gbox_tblContentsThemeStudent', add_button);
console.log("ожидание таблицы студентов установлено");