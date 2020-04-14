/* eslint-disable no-unused-vars */
// @ts-nocheck
/* eslint-disable no-undef */

// const vscode = undefined
const vscode = acquireVsCodeApi()
var packageJsonUri = ''
var dependencies = []
var processDependencies = []

const cardHTML = (data) => `
<div class="dependency-card">

    ${data.name} <span class="version">${data.version} ${data.installed ? '- Installed' : ''}</span>

    <div class="dependency-description">
        
        ${data.description}
        
        ${ data.repository !== undefined ? '<div class="repo-link"><a href="' + data.repository + '">Repository</a></div>' : ''}

        <div class="other-info">
            <img onerror="this.style.display='none'" src="https://img.shields.io/npm/dm/${data.name}.svg" />
            <img onerror="this.style.display='none'" src="https://img.shields.io/npm/v/${data.name}.svg">
        </div>
    </div>

    <div class="manage-btns">
        <div onclick="managePackage(this, '${data.name}', '${data.installed ? 'remove' : 'add'}')" class="dependency-btn">
            <i class="material-icons">${data.installed ? 'clear' : 'add'}</i>
        </div>
    </div>

</div>`

$(document).ready(function () {

    packageJsonUri = document.getElementById('package-json-uri').value;

    packageJSON()
})

function packageJSON() {

    $.get(packageJsonUri, (data, status) => {

        dependencies = objectsToArray(data.dependencies).reverse().concat(objectsToArray(data.devDependencies).reverse());

        $('#dependency-list').html('');

        $('#dependency-count').html(`${dependencies.length} dependencies`)

        dependencies.forEach((data) => {
            $('#dependency-list').append(cardHTML({
                name: data.name,
                version: data.version,
                description: '',
                repository: undefined,
                installed: true
            }))
        })

        sendVSCode('loaded', 'Document loaded to DOM')
    })
}

function objectsToArray(objects) {
    let arr = []
    for (var key in objects) {
        arr.push({ name: key, version: objects[key] })
    }
    return arr
}

function sendVSCode(command, text) {

    if (vscode !== undefined) {
        vscode.postMessage({ command, text })
    }
}

function managePackage(e, name, action) {

    const card = $(e).parent().parent()

    card.find('.manage-btns').hide()

    card.find('.version').text(` will be ${action == 'add' ? 'added' : 'removed'}, please check terminal for more details`)

    sendVSCode(action, name)
}

function clearSearch() {
    $('#dependency-input').val('')
    packageJSON()
}

function npmFind(e) {

    let query = e.value

    if (query.length >= 3) {

        $('#dependency-search-clear-btn').css('display', 'flex');

        $.get('https://registry.npmjs.com/-/v1/search?text=' + query.toLowerCase(), (data, status) => {

            $('#dependency-list').html('')

            $('#dependency-count').html(`${data.objects.length} dependencies`)

            data.objects.forEach(entry => {
                $('#dependency-list').append(cardHTML({
                    name: entry.package.name,
                    version: entry.package.version,
                    description: entry.package.description,
                    repository: entry.package.links.repository,
                    installed: dependencies.filter(elem => elem.name === entry.package.name).length > 0
                }))
            })
        })

    } else {
        $('#dependency-search-clear-btn').css('display', 'none');
        packageJSON()
    }
}