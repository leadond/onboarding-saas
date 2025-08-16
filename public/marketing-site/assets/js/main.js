document.addEventListener('DOMContentLoaded', () => {

    // SMOOTH SCROLLING FOR NAV LINKS
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // FADE-IN ANIMATION ON SCROLL
    const fadeElems = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'none';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    fadeElems.forEach(elem => {
        observer.observe(elem);
    });
    
    // CONTACT FORM SUBMISSION
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                companyName: document.getElementById('companyName').value,
                comment: document.getElementById('comment').value,
            };

            formMessage.textContent = '';
            formMessage.className = '';

            try {
                const response = await fetch('http://localhost:3000/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                if (response.ok) {
                    formMessage.textContent = 'Thank you for your message. We will get back to you shortly!';
                    formMessage.className = 'form-message-success';
                    contactForm.reset();
                } else {
                    formMessage.textContent = result.error || 'An error occurred. Please try again.';
                    formMessage.className = 'form-message-error';
                }
            } catch (error) {
                formMessage.textContent = 'An unexpected error occurred. Please try again.';
                formMessage.className = 'form-message-error';
            }
        });
    }
});