const searchInput = document.getElementById('input');
const searchButton = document.getElementById('button');
const galleryContainer = document.getElementById('gallery');

/** HTML element builder*/
function buildElement(tag, options = {}) {
    const el = document.createElement(tag);
    if (options.className) el.classList.add(...options.className.split(' '));
    if (options.text) el.textContent = options.text;
    if (options.href) el.href = options.href;
    if (options.target) el.target = options.target;
    return el;
}

/** Repo data fetch for specified user */
async function getData(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
        if (!response.ok) throw new Error("User not found or API limit reached, try again later!");
        const repos = await response.json();

        if (repos.length == 0) {
            throw new Error("No repos found!");
        }

        renderGallery(repos);
    } catch (error) {
        console.error(error);
    }
}

/** Repo languages fetch */
async function getLanguages(username, repoName) {
    const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/languages`);
    const langData = await response.json();
    return Object.keys(langData).join(', ');
}

/** Gallery rendering function that uses buildElement and fetched data*/
async function renderGallery(repos) {
    galleryContainer.innerHTML = '';

    for (let index = 0; index < repos.length; index++) {
        const repo = repos[index];
        const languages = await getLanguages(repo.owner.login, repo.name);

        const newCard = buildElement('div', { className: 'card' });

        const titleHeader = buildElement('h3');
        const titleLink = buildElement('a', { href: repo.html_url, target: '_blank' });
        titleLink.appendChild(buildElement('i', { className: 'fab fa-github' }));
        titleLink.appendChild(document.createTextNode(`${repo.name}`));
        titleHeader.appendChild(titleLink);

        const descText = buildElement('p', {
            className: 'description',
            text: repo.description || 'No description.'
        });

        const detailsDiv = buildElement('div', { className: 'details' });
        function appendDetail(label, value) {
            const p = buildElement('p');
            const strong = buildElement('strong', { text: label });
            p.appendChild(strong);
            p.appendChild(document.createTextNode(`${value}`));
            detailsDiv.appendChild(p);
        }

        appendDetail('Created:', new Date(repo.created_at).toLocaleDateString());
        appendDetail('Updated:', new Date(repo.updated_at).toLocaleDateString());
        appendDetail('Languages:', languages);
        appendDetail('Watchers:', repo.watchers_count);

        newCard.appendChild(titleHeader);
        newCard.appendChild(descText);
        newCard.appendChild(detailsDiv);

        galleryContainer.appendChild(newCard);
    }
}

searchButton.addEventListener('click', () => {
    const username = searchInput.value.trim();

    if (username !== "") {
        galleryContainer.innerHTML = '';
        galleryContainer.appendChild(buildElement('p', { text: 'Loading...' }));
        getData(username);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    getData('c-pierce-1')
})