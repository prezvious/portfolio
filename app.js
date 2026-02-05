/**
 * Portfolio Website - Main JavaScript
 * Handles: Theme toggle, mobile menu, project filtering, search, contact form, scroll animations
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    DEBOUNCE_DELAY: 300,
    SCROLL_OFFSET: 80
};

// ============================================
// DOM ELEMENTS
// ============================================
const DOM = {
    html: document.documentElement,
    themeToggle: document.querySelector('.theme-toggle'),
    mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
    navList: document.querySelector('.nav-list'),
    navLinks: document.querySelectorAll('.nav-link'),
    projectsGrid: document.getElementById('projects-grid'),
    searchInput: document.getElementById('project-search'),
    filterTags: document.querySelectorAll('.filter-tag'),
    noResults: document.getElementById('no-results'),
    clearFiltersBtn: document.getElementById('clear-filters')
};

// ============================================
// STATE
// ============================================
let state = {
    currentFilter: 'all',
    searchQuery: '',
    projects: []
};

// ============================================
// THEME MANAGEMENT
// ============================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    DOM.html.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const currentTheme = DOM.html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    DOM.html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ============================================
// MOBILE MENU
// ============================================
function toggleMobileMenu() {
    const isOpen = DOM.mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    DOM.mobileMenuBtn.setAttribute('aria-expanded', !isOpen);
    DOM.navList.classList.toggle('mobile-open', !isOpen);
}

function closeMobileMenu() {
    DOM.mobileMenuBtn.setAttribute('aria-expanded', 'false');
    DOM.navList.classList.remove('mobile-open');
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
}

// ============================================
// PROJECT RENDERING
// ============================================
function renderProjectCard(project) {
    return `
        <article class="project-card animate-on-scroll" data-id="${project.id}" data-stack="${project.stack.join(' ')}">
            <div class="project-thumbnail">
                <img src="${project.screenshot}" alt="${project.title} screenshot" loading="lazy">
            </div>
            <div class="project-body">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.short}</p>
                <div class="project-stack">
                    ${project.stack.map(tech => `<span class="project-stack-tag">${tech}</span>`).join('')}
                </div>
                ${project.metrics ? `<p class="project-metrics">${project.metrics}</p>` : ''}
                <div class="project-links">
                    <a href="${project.demo}" class="project-link" target="_blank" rel="noopener">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Live Demo
                    </a>
                    <a href="${project.repo}" class="project-link" target="_blank" rel="noopener">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                    </a>
                </div>
            </div>
        </article>
    `;
}

function renderProjects(projects) {
    if (!DOM.projectsGrid) return;

    const filtered = filterProjects(projects);

    if (filtered.length === 0) {
        DOM.projectsGrid.innerHTML = '';
        DOM.noResults.hidden = false;
    } else {
        DOM.projectsGrid.innerHTML = filtered.map(renderProjectCard).join('');
        DOM.noResults.hidden = true;

        // Trigger animations for new elements with a stagger
        const newCards = DOM.projectsGrid.querySelectorAll('.project-card');

        // Use intersection observer for new cards as well, or just force animate
        // For simplicity, let's observe them if we want scroll animation,
        // OR simply animate them in since they just appeared.
        // Let's force animate them with stagger for better UX on filter.
        newCards.forEach((card, index) => {
            // Remove animate-on-scroll class if we are manually animating to avoid conflict?
            // Or just add is-visible.
            setTimeout(() => {
                card.classList.add('is-visible');
            }, index * 100);
        });
    }
}

// ============================================
// PROJECT FILTERING & SEARCH
// ============================================
function filterProjects(projects) {
    return projects.filter(project => {
        // Filter by tag
        const matchesFilter = state.currentFilter === 'all' ||
            project.stack.some(tech => tech.toLowerCase().includes(state.currentFilter.toLowerCase()));

        // Filter by search query
        const query = state.searchQuery.toLowerCase();
        const matchesSearch = !query ||
            project.title.toLowerCase().includes(query) ||
            project.short.toLowerCase().includes(query) ||
            project.stack.some(tech => tech.toLowerCase().includes(query));

        return matchesFilter && matchesSearch;
    });
}

function setFilter(filter) {
    state.currentFilter = filter;

    DOM.filterTags.forEach(tag => {
        tag.classList.toggle('active', tag.dataset.filter === filter);
    });

    renderProjects(state.projects);
}

function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

const handleSearch = debounce((query) => {
    state.searchQuery = query;
    renderProjects(state.projects);
}, CONFIG.DEBOUNCE_DELAY);

function clearFilters() {
    state.currentFilter = 'all';
    state.searchQuery = '';

    if (DOM.searchInput) DOM.searchInput.value = '';

    DOM.filterTags.forEach(tag => {
        tag.classList.toggle('active', tag.dataset.filter === 'all');
    });

    renderProjects(state.projects);
}

// ============================================
// SMOOTH SCROLL
// ============================================
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        const offsetTop = element.offsetTop - CONFIG.SCROLL_OFFSET;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}



// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    // Theme toggle
    DOM.themeToggle?.addEventListener('click', toggleTheme);

    // Mobile menu
    DOM.mobileMenuBtn?.addEventListener('click', toggleMobileMenu);

    // Close mobile menu on nav link click
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            closeMobileMenu();

            // Smooth scroll for anchor links
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(href);
            }
        });
    });

    // Project filtering
    DOM.filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            setFilter(tag.dataset.filter);
        });
    });

    // Project search
    DOM.searchInput?.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });

    // Clear filters
    DOM.clearFiltersBtn?.addEventListener('click', clearFilters);



    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav') && !e.target.closest('.mobile-menu-btn')) {
            closeMobileMenu();
        }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

// ============================================
// LOAD PROJECTS
// ============================================
async function loadProjects() {
    try {
        // Try to load from JSON file
        const response = await fetch('projects.json');
        if (response.ok) {
            state.projects = await response.json();
        } else {
            console.error('Failed to load projects: ' + response.status);
            state.projects = [];
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        state.projects = [];
    }

    renderProjects(state.projects);
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
    initTheme();
    initEventListeners();
    initScrollAnimations(); // Initialize scroll animations
    loadProjects();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
