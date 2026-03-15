'use strict';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

console.log('Health Buddy script loaded');

// Set dark theme by default
document.documentElement.setAttribute('data-theme', 'dark');



/**
 * Add event listener on multiple elements
 */

const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}



/**
 * MOBILE NAVBAR TOGGLER
 */

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");

const toggleNav = () => {
  navbar.classList.toggle("active");
  document.body.classList.toggle("nav-active");
}

addEventOnElements(navTogglers, "click", toggleNav);



/**
 * HEADER ANIMATION
 * When scrolled donw to 100px header will be active
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    header.classList.add("active");
    header.classList.add("scrolled");
    if (backTopBtn) backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    header.classList.remove("scrolled");
    if (backTopBtn) backTopBtn.classList.remove("active");
  }
});

// Get the "Doctors Near Me" link element
const doctorsLink = document.getElementById('doctors-link');

// Add a click event listener to the link
if (doctorsLink) {
  doctorsLink.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default link behavior

    // Add a class to the link to show the tooltip
    doctorsLink.classList.add('show-tooltip');

    // Create a new tooltip element
    const tooltip = document.createElement('span');
    tooltip.classList.add('tooltip');
    tooltip.innerText = 'Coming Soon';

    // Append the tooltip element to the link element
    doctorsLink.appendChild(tooltip);

    // Remove the tooltip after 3 seconds
    setTimeout(() => {
      doctorsLink.removeChild(tooltip);
      doctorsLink.classList.remove('show-tooltip');
    }, 500);
  });
}

/**
 * SLIDER
 */

const slider = document.querySelector("[data-slider]");
const sliderContainer = document.querySelector("[data-slider-container]");
const sliderPrevBtn = document.querySelector("[data-slider-prev]");
const sliderNextBtn = document.querySelector("[data-slider-next]");

if (slider && sliderContainer) {
  let totalSliderVisibleItems = Number(getComputedStyle(slider).getPropertyValue("--slider-items"));
  let totalSlidableItems = sliderContainer.childElementCount - totalSliderVisibleItems;

  let currentSlidePos = 0;

  const moveSliderItem = function () {
    sliderContainer.style.transform = `translateX(-${sliderContainer.children[currentSlidePos].offsetLeft}px)`;
  }

  /**
   * NEXT SLIDE
   */

  const slideNext = function () {
    const slideEnd = currentSlidePos >= totalSlidableItems;

    if (slideEnd) {
      currentSlidePos = 0;
    } else {
      currentSlidePos++;
    }

    moveSliderItem();
  }

  if (sliderNextBtn) {
    sliderNextBtn.addEventListener("click", slideNext);
  }

  /**
   * PREVIOUS SLIDE
   */

  const slidePrev = function () {
    if (currentSlidePos <= 0) {
      currentSlidePos = totalSlidableItems;
    } else {
      currentSlidePos--;
    }

    moveSliderItem();
  }

  if (sliderPrevBtn) {
    sliderPrevBtn.addEventListener("click", slidePrev);
  }

  /**
   * RESPONSIVE
   */
  window.addEventListener("resize", function () {
    totalSliderVisibleItems = Number(getComputedStyle(slider).getPropertyValue("--slider-items"));
    totalSlidableItems = sliderContainer.childElementCount - totalSliderVisibleItems;

    moveSliderItem();
  });
}

  /**
   * AUTOMATICALLY DETECT ACTIVE PAGE & SET TITLE INDICATOR
   */
  const links = document.querySelectorAll(".navbar-link");
  let activePageName = "Home";
  const currentPath = window.location.href.split('#')[0].split('?')[0];

  links.forEach(link => {
      link.classList.remove("active");
      const linkPath = link.href.split('#')[0].split('?')[0];
      
      if (linkPath === currentPath || (currentPath.endsWith('/') && linkPath.endsWith('index.html'))) {
          link.classList.add("active");
          activePageName = link.textContent.trim();
      }
  });

  const pageTitleIndicators = document.querySelectorAll("#page-title-indicator");
  pageTitleIndicators.forEach(indicator => {
      if (activePageName && activePageName.toLowerCase() !== "home") {
          indicator.innerHTML = ` | ${activePageName}`;
      } else {
          indicator.innerHTML = "";
      }
  });

  // Hero section buttons logic
  const askHealthBuddyBtn = document.getElementById("askHealthBuddy");
  if(askHealthBuddyBtn){
      askHealthBuddyBtn.addEventListener("click", function(){
          window.location.href = "chatbot.html";
      });
  }

  const checkSymptomsBtn = document.getElementById("checkSymptoms");
  if(checkSymptomsBtn){
      checkSymptomsBtn.addEventListener("click", function(){
          window.location.href = "chatbot.html?symptom=true";
      });
  }
});
