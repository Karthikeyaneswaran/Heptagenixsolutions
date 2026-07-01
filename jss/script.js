document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // DYNAMIC LOGO IMAGE WRAPPER (ZOOM & CROP)
  // ==========================================
  document.querySelectorAll('.logo-img').forEach(img => {
    if (img.parentNode.classList.contains('logo-img-wrapper')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'logo-img-wrapper';
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
  });

  // ==========================================
  // NAVIGATION ACTIVE STATE HIGHLIGHTER
  // ==========================================
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const allNavLinks = document.querySelectorAll('.nav-link, .dropdown-item');

  allNavLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
      
      // If the active link is inside a services dropdown, highlight parent toggle too
      if (link.classList.contains('dropdown-item')) {
        const parentDropdown = link.closest('.nav-item-dropdown');
        if (parentDropdown) {
          const toggleLink = parentDropdown.querySelector('.nav-link');
          if (toggleLink) toggleLink.classList.add('active');
        }
      }
    }
  });

  // ==========================================
  // SCROLL-TRIGGERED STICKY HEADER
  // ==========================================
  const header = document.querySelector('.header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Trigger once on load in case page was refreshed while scrolled

  // ==========================================
  // MOBILE HAMBURGER MENU & DRAWER CONTROL
  // ==========================================
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      
      // Lock scroll behind menu
      if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Close menu when clicking normal links
    const navLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle)');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ==========================================
  // MOBILE ACCORDION DROPDOWN FOR SERVICES
  // ==========================================
  const dropdownToggle = document.querySelector('.nav-item-dropdown > .dropdown-toggle');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener('click', (e) => {
      // Only run toggle logic on mobile/tablet viewports (<= 768px)
      if (window.innerWidth <= 768) {
        e.preventDefault(); // Stop navigation to `#`
        dropdownMenu.classList.toggle('active');
        
        // Rotate chevron icon
        const chevron = dropdownToggle.querySelector('svg');
        if (chevron) {
          if (dropdownMenu.classList.contains('active')) {
            chevron.style.transform = 'rotate(180deg)';
          } else {
            chevron.style.transform = 'rotate(0deg)';
          }
        }
      }
    });
  }

  // Handle window resizing (close mobile menu if resized to desktop)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      if (hamburger && hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
      if (dropdownMenu && dropdownMenu.classList.contains('active')) {
        dropdownMenu.classList.remove('active');
        const chevron = dropdownToggle.querySelector('svg');
        if (chevron) chevron.style.transform = '';
      }
    }
  });

  // ==========================================
  // INTERSECTION OBSERVER FOR ENTRANCE REVEAL
  // ==========================================
  const revealElements = document.querySelectorAll('.scroll-reveal');

  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once animated, stop observing this item
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback if IntersectionObserver is not supported (older browsers)
    revealElements.forEach(el => {
      el.classList.add('active');
    });
  }

  // ==========================================
  // FAQ ACCORDION EXPANSION MECHANISM
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const accordionHeader = item.querySelector('.faq-header');
    const accordionBody = item.querySelector('.faq-body');

    if (accordionHeader && accordionBody) {
      accordionHeader.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close all other open accordions in this list
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            const otherBody = otherItem.querySelector('.faq-body');
            if (otherBody) otherBody.style.maxHeight = '0px';
          }
        });

        // Toggle current item
        if (!isOpen) {
          item.classList.add('active');
          accordionBody.style.maxHeight = accordionBody.scrollHeight + 'px';
        } else {
          item.classList.remove('active');
          accordionBody.style.maxHeight = '0px';
        }
      });
    }
  });

  // ==========================================
  // CONTACT FORM VALIDATION & SUCCESS POPUP
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  const successOverlay = document.getElementById('successOverlay');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isFormValid = true;
      // Get all inputs inside form that are required
      const requiredInputs = contactForm.querySelectorAll('[required]');

      requiredInputs.forEach(input => {
        const errorElement = input.nextElementSibling;
        
        // Reset invalid states
        input.classList.remove('invalid');
        if (errorElement && errorElement.classList.contains('error-message')) {
          errorElement.style.display = 'none';
        }

        // Validate blank input
        if (!input.value.trim()) {
          isFormValid = false;
          showErrorState(input, 'This field is required. Please fill it in.');
        } else {
          // Specific input validations
          if (input.type === 'email' && !validateEmailFormat(input.value)) {
            isFormValid = false;
            showErrorState(input, 'Please enter a valid email address (e.g. name@example.com).');
          }
          if (input.type === 'tel' && !validatePhoneFormat(input.value)) {
            isFormValid = false;
            showErrorState(input, 'Please enter a valid phone number (at least 10 digits).');
          }
        }
      });

      if (isFormValid) {
        // Form validated successfully! Trigger overlay
        if (successOverlay) {
          successOverlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
        contactForm.reset();
      }
    });
  }

  if (closeSuccessBtn && successOverlay) {
    closeSuccessBtn.addEventListener('click', () => {
      successOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  function showErrorState(input, errorMessage) {
    input.classList.add('invalid');
    const errorSpan = input.nextElementSibling;
    if (errorSpan && errorSpan.classList.contains('error-message')) {
      errorSpan.textContent = errorMessage;
      errorSpan.style.display = 'block';
    }
  }

  function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(String(email).toLowerCase());
  }

  function validatePhoneFormat(phone) {
    // Remove spaces, hyphens, and parentheses
    const stripped = phone.replace(/[\s\-\(\)]/g, '');
    // Standard phone check: digits only (optionally starting with +), between 7 and 15 digits
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    return phoneRegex.test(stripped);
  }

  // ==========================================
  // TRANSLATIONS DICTIONARY & SWITCH LOGIC
  // ==========================================
  const translations = {
    en: {
      // Navigation
      'nav-home': 'Home',
      'nav-about': 'About',
      'nav-services': 'Services',
      'nav-pricing': 'Pricing',
      'nav-contact': 'Contact',
      'nav-why-us': 'Why Us',
      'service-web': 'Web Development',
      'service-host': 'Hosting & Maintenance',
      'service-seo': 'SEO Optimization',
      'service-full': 'Full Stack Applications',
      'service-social': 'Social Media Management',
      'service-ads': 'Ad Marketing',
      // Footer
      'footer-quick-links': 'Quick Links',
      'footer-our-services': 'Our Services',
      'footer-get-in-touch': 'Get in Touch',
      'footer-serving': 'Tamil Nadu, India',
      'footer-serving-sub': 'Serving businesses across the state',
      'footer-marquee': 'This website was developed by Heptagenix Solutions and all rights reserved by Heptagenix Solutions 2026',
      // Chatbot Widget
      'whatsapp-tooltip': 'Need a free quote? Chat with our experts!',
      // Switch button
      'lang-btn-text': 'தமிழ்'
    },
    ta: {
      // Navigation
      'nav-home': 'முகப்பு',
      'nav-about': 'எங்களைப் பற்றி',
      'nav-why-us': 'ஏன் நாங்கள்?',
      'nav-services': 'சேவைகள்',
      'nav-pricing': 'கட்டணங்கள்',
      'nav-contact': 'தொடர்பு',
      'service-web': 'இணையதள உருவாக்கம்',
      'service-host': 'ஹோஸ்டிங் & பராமரிப்பு',
      'service-seo': 'தேடுபொறி உகப்பாக்கம் (SEO)',
      'service-full': 'முழு ஸ்டேக் பயன்பாடுகள்',
      'service-social': 'சமூக ஊடக மேலாண்மை',
      'service-ads': 'விளம்பர சந்தைப்படுத்தல்',
      // Footer
      'footer-quick-links': 'விரைவான இணைப்புகள்',
      'footer-our-services': 'எங்கள் சேவைகள்',
      'footer-get-in-touch': 'தொடர்பு கொள்ள',
      'footer-serving': 'தமிழ்நாடு, இந்தியா',
      'footer-serving-sub': 'மாநிலம் முழுவதும் உள்ள வணிகங்களுக்கான சேவை',
      'footer-marquee': 'இந்த இணையதளம் ஹெப்டாஜெனிக்ஸ் சொல்யூஷன்ஸ் மூலம் உருவாக்கப்பட்டது மற்றும் அனைத்து உரிமைகளும் ஹெப்டாஜெனிக்ஸ் சொல்யூஷன்ஸ் 2026 நிறுவனத்திற்குச் சொந்தமானது.',
      // Chatbot Widget
      'whatsapp-tooltip': 'இலவச ஆலோசனை வேண்டுமா? வாட்ஸ்அப்பில் அரட்டையடிக்கவும்!',
      // Switch button
      'lang-btn-text': 'English'
    }
  };

  let currentLang = localStorage.getItem('preferredLang') || 'en';

  const translatePageContent = (lang) => {
    // Translate common button and interface actions
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline-white').forEach(btn => {
      const text = btn.innerText.trim().toLowerCase();
      if (text === 'get free quote' || text === 'இலவச ஆலோசனை' || text === 'get free consultation' || text === 'இலவச ஆலோசனை பெறுக') {
        btn.innerText = lang === 'ta' ? 'இலவச ஆலோசனை' : 'Get Free Quote';
      }
      if (text === 'view services' || text === 'சேவைகளைக் காண்க') {
        btn.innerText = lang === 'ta' ? 'சேவைகளைக் காண்க' : 'View Services';
      }
      if (text === 'learn more' || text === 'learn more →' || text === 'மேலும் அறிய' || text === 'மேலும் அறிய →') {
        btn.innerText = lang === 'ta' ? 'மேலும் அறிய →' : 'Learn More →';
      }
    });

    // Translate page hero title headers generically
    const pageHeroH1 = document.querySelector('.page-hero h1');
    if (pageHeroH1) {
      const titleText = pageHeroH1.innerText.trim().toLowerCase();
      if (titleText.includes('about') || titleText.includes('பற்றி')) {
        pageHeroH1.innerText = lang === 'ta' ? 'ஹெப்டாஜெனிக்ஸ் சொல்யூஷன்ஸ் பற்றி' : 'About Heptagenix Solutions';
      } else if (titleText.includes('pricing') || titleText.includes('கட்டணத்')) {
        pageHeroH1.innerText = lang === 'ta' ? 'எளிமையான, வெளிப்படையான கட்டணத் திட்டங்கள்' : 'Simple, Transparent Pricing Plans';
      } else if (titleText.includes('web development') || titleText.includes('இணையதள')) {
        pageHeroH1.innerText = lang === 'ta' ? 'இணையதள உருவாக்க சேவைகள்' : 'Web Development Services';
      } else if (titleText.includes('hosting') || titleText.includes('ஹோஸ்டிங்')) {
        pageHeroH1.innerText = lang === 'ta' ? 'ஹோஸ்டிங் & பராமரிப்பு சேவைகள்' : 'Hosting & Maintenance Services';
      } else if (titleText.includes('seo') || titleText.includes('தேடுபொறி')) {
        pageHeroH1.innerText = lang === 'ta' ? 'தேடுபொறி உகப்பாக்கம் (SEO) சேவைகள்' : 'SEO Optimization Services';
      } else if (titleText.includes('full stack') || titleText.includes('முழு ஸ்டேக்')) {
        pageHeroH1.innerText = lang === 'ta' ? 'முழு ஸ்டேக் இணைய பயன்பாடுகள்' : 'Full Stack Applications';
      } else if (titleText.includes('social media') || titleText.includes('ஊடக')) {
        pageHeroH1.innerText = lang === 'ta' ? 'சமூக ஊடக மேலாண்மை சேவைகள்' : 'Social Media Management';
      } else if (titleText.includes('ad marketing') || titleText.includes('விளம்பர')) {
        pageHeroH1.innerText = lang === 'ta' ? 'விளம்பர சந்தைப்படுத்தல் சேவைகள்' : 'Ad Marketing Services';
      }
    }

    // Home Page specific elements
    if (currentPath === 'index.html') {
      const heroSubtitle = document.querySelector('.hero-subtitle');
      if (heroSubtitle) heroSubtitle.innerText = lang === 'ta' ? 'உயர்தர டிஜிட்டல் நிறுவனம்' : 'Premium Digital Agency';

      const heroH1 = document.querySelector('.hero h1');
      if (heroH1) {
        heroH1.innerText = lang === 'ta' 
          ? 'தமிழ்நாட்டின் வளரும் வணிகங்களுக்கான மலிவான டிஜிட்டல் தீர்வுகள்' 
          : "Affordable Digital Solutions for Tamil Nadu's Growing Businesses";
      }

      const heroText = document.querySelector('.hero-text');
      if (heroText) {
        heroText.innerText = lang === 'ta'
          ? 'உள்ளூர் வணிகங்கள் நம்பிக்கையை ஏற்படுத்தி வேகமாக வளர உதவும் உயர்தர இணையதளங்கள், தனிப்பயன் இணைய செயலிகள் மற்றும் முடிவுகளைத் தரும் மார்க்கெட்டிங் பிரச்சாரங்களை நாங்கள் உருவாக்குகிறோம்.'
          : 'We build high-performance websites, custom web applications, and result-oriented marketing campaigns that help local businesses establish trust and scale rapidly.';
      }

      const trustSpans = document.querySelectorAll('.trust-item span');
      const trustTexts = {
        en: ['100% Tamil Nadu Focused', 'Affordable Transparent Pricing', 'Dedicated Support Partner', 'Modern & Secure Tech Stack'],
        ta: ['100% தமிழ்நாட்டிற்கு முன்னுரிமை', 'மலிவான வெளிப்படையான கட்டணம்', 'அர்ப்பணிப்புள்ள ஆதரவு கூட்டாளி', 'நவீன மற்றும் பாதுகாப்பான தொழில்நுட்பம்']
      };
      trustSpans.forEach((span, idx) => {
        if (trustTexts[lang][idx]) span.innerText = trustTexts[lang][idx];
      });

      const sectionHeaders = document.querySelectorAll('.section-header h2');
      const sectionTexts = document.querySelectorAll('.section-header p');
      if (sectionHeaders.length >= 4) {
        // Index 0: Services
        sectionHeaders[0].innerText = lang === 'ta' ? 'எங்கள் தொழில்முறை டிஜிட்டல் சேவைகள்' : 'Our Professional Digital Services';
        sectionTexts[0].innerText = lang === 'ta' 
          ? 'சிறு வணிக இலக்குகள் மற்றும் பிராந்திய சந்தை இயக்கங்களுக்கு ஏற்ப தனிப்பயனாக்கப்பட்ட வலுவான, உயர்தர தொழில்நுட்ப மற்றும் சந்தைப்படுத்தல் தீர்வுகளை நாங்கள் வழங்குகிறோம்.'
          : 'We deliver robust, high-quality technical and marketing solutions customized for small business goals and regional market dynamics.';

        // Index 1: Why Choose Us
        sectionHeaders[1].innerText = lang === 'ta' ? 'வணிகங்கள் ஏன் எங்களை நம்புகின்றன?' : 'Why Businesses Trust Heptagenix Solutions';
        sectionTexts[1].innerText = lang === 'ta'
          ? 'பெரிய நகர முகமைகளின் அதிக கட்டணம் மற்றும் நம்பகத்தன்மையற்ற தனிநபர்களின் சேவைகளுக்கு மாற்றாக நாங்கள் செயல்படுகிறோம்.'
          : 'We bridge the gap between expensive big-city agencies and unreliable freelancers by offering professional, top-tier engineering with regional business understanding.';

        // Index 2: Our Projects (New)
        sectionHeaders[2].innerText = lang === 'ta' ? 'எங்கள் திட்டங்கள்' : 'Our Projects';
        sectionTexts[2].innerText = lang === 'ta'
          ? 'தமிழ்நாடு முழுவதும் நாங்கள் வெற்றிகரமாக உருவாக்கிய இணையதளங்கள் மற்றும் டிஜிட்டல் தளங்களின் தொகுப்பு.'
          : 'A showcase of our successfully launched client portals and digital applications across Tamil Nadu.';

        // Index 3: Process (Shifted)
        sectionHeaders[3].innerText = lang === 'ta' ? 'எங்கள் வளர்ச்சி செயல்முறை' : 'Our Development Process';
        sectionTexts[3].innerText = lang === 'ta'
          ? 'உங்கள் யோசனையை ஒரு நேரடி, அதிக மாற்றங்களைக் கொடுக்கும் டிஜிட்டல் தளமாக மாற்றுவதற்கான தெளிவான வழிமுறை.'
          : 'A clear, transparent, and streamlined roadmap to transform your initial concept into a live, high-converting digital platform.';
      }

      // Services cards translation
      const serviceCards = document.querySelectorAll('.service-card');
      const serviceTranslations = {
        en: [
          {
            title: 'Web Development',
            desc: 'Stunning, fast-loading corporate websites custom-coded to reflect your brand and convert visitors into buyers.',
            link: 'Learn More'
          },
          {
            title: 'Hosting & Maintenance',
            desc: 'Hassle-free domain setup, lightning-fast cloud hosting, security monitoring, and regular backups to keep you online 24/7.',
            link: 'Learn More'
          },
          {
            title: 'SEO Optimization',
            desc: 'Drive organic traffic from searches across Tamil Nadu. Maximize your visibility in Google Local Pack results.',
            link: 'Learn More'
          },
          {
            title: 'Full Stack Applications',
            desc: 'Custom administrative portals, booking scripts, user management systems, and backend databases built for scale.',
            link: 'Learn More'
          },
          {
            title: 'Social Media Management',
            desc: 'Engaging social media campaigns, professional poster designs, and calendar schedules targeting Tamil customers.',
            link: 'Learn More'
          },
          {
            title: 'Ad Marketing',
            desc: 'High-converting local Google Ads and Meta campaigns optimized to generate inquiries within your marketing budget.',
            link: 'Learn More'
          }
        ],
        ta: [
          {
            title: 'இணையதள உருவாக்கம்',
            desc: 'உங்கள் பிராண்டை பிரதிபலிக்கும் மற்றும் பார்வையாளர்களை வாடிக்கையாளர்களாக மாற்றும் அதிவேக, உயர்தர இணையதளங்கள்.',
            link: 'மேலும் அறிய'
          },
          {
            title: 'ஹோஸ்டிங் & பராமரிப்பு',
            desc: '24/7 ஆன்லைனில் இருக்க எளிதான டொமைன் அமைப்பு, அதிவேக கிளவுட் ஹோஸ்டிங் மற்றும் வழக்கமான பேக்கப் ஆதரவு.',
            link: 'மேலும் அறிய'
          },
          {
            title: 'தேடுபொறி உகப்பாக்கம் (SEO)',
            desc: 'தமிழ்நாடு முழுவதும் தேடல்களில் இருந்து வாடிக்கையாளர்களை ஈர்க்கவும். கூகுள் லோக்கல் மேப்பில் தெரிவுநிலையை அதிகரிக்கவும்.',
            link: 'மேலும் அறிய'
          },
          {
            title: 'முழு ஸ்டேக் பயன்பாடுகள்',
            desc: 'தனிப்பயன் நிர்வாக போர்டல்கள், முன்பதிவு ஸ்கிரிப்ட்கள், பயனர் மேலாண்மை அமைப்புகள் மற்றும் தரவுத்தளங்கள்.',
            link: 'மேலும் அறிய'
          },
          {
            title: 'சமூக ஊடக மேலாண்மை',
            desc: 'தமிழ் வாடிக்கையாளர்களை இலக்காகக் கொண்ட ஈர்க்கக்கூடிய சமூக ஊடக பிரச்சாரங்கள் மற்றும் போஸ்டர் வடிவமைப்பு அட்டவணைகள்.',
            link: 'மேலும் அறிய'
          },
          {
            title: 'விளம்பர சந்தைப்படுத்தல்',
            desc: 'உங்களது சந்தைப்படுத்தல் பட்ஜெட்டுக்குள் விசாரணைகளை உருவாக்க உகந்த கூகுள் விளம்பரங்கள் மற்றும் மெட்டா பிரச்சாரங்கள்.',
            link: 'மேலும் அறிய'
          }
        ]
      };

      serviceCards.forEach((card, idx) => {
        const trans = serviceTranslations[lang][idx];
        if (trans) {
          const h3 = card.querySelector('h3');
          const p = card.querySelector('p');
          const a = card.querySelector('.service-link');
          if (h3) h3.innerText = trans.title;
          if (p) p.innerText = trans.desc;
          if (a) {
            a.innerHTML = `${trans.link} <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
          }
        }
      });

      // Why Choose Us section translation
      const whyChooseUsP = document.getElementById('whyChooseUsP');
      const whyChooseUsBtn = document.getElementById('whyChooseUsBtn');
      if (whyChooseUsP) {
        whyChooseUsP.innerText = lang === 'ta'
          ? 'எங்கள் நோக்கம் உங்கள் வணிகத்திற்கான நிலையான வளர்ச்சி வழிகளாகச் செயல்படும் டிஜிட்டல் தளங்களை உருவாக்குவதாகும். நாங்கள் ரெடிமேட் டெம்ப்ளேட்டுகளைப் பயன்படுத்துவதில்லை, மேலும் தொழில்நுட்பக் காரணங்களைக் கூறி கூடுதல் கட்டணங்களை மறைப்பதில்லை.'
          : "Our objective is to deliver digital assets that act as permanent growth channels for your business. We don't use cookie-cutter templates, and we don't hide costs behind confusing technical jargon.";
      }
      if (whyChooseUsBtn) {
        whyChooseUsBtn.innerText = lang === 'ta' ? 'எங்கள் குழுவைப் பற்றி மேலும் அறிய' : 'More About Our Team';
      }

      const whyCards = document.querySelectorAll('.why-card');
      const whyTranslations = {
        en: [
          { title: 'Affordable Pricing', desc: 'Tailored pricing plans optimized to suit the exact requirements of emerging local retail and service shops.' },
          { title: '1-on-1 Guidance', desc: 'Direct communication and dedicated support throughout the design, development, and launch process.' },
          { title: 'Local Market Insights', desc: 'Specialized design and copy strategies customized to match local customer habits across Tamil Nadu.' },
          { title: 'End-to-End Delivery', desc: 'We manage everything, from secure domain setup to high-converting local digital ad setups.' }
        ],
        ta: [
          { title: 'மலிவான கட்டணம்', desc: 'வளரும் உள்ளூர் சில்லறை மற்றும் சேவை கடைகளின் துல்லியமான தேவைகளுக்கு ஏற்ப வடிவமைக்கப்பட்ட கட்டணத் திட்டங்கள்.' },
          { title: 'நேரடி வழிகாட்டுதல்', desc: 'வடிவமைப்பு, உருவாக்கம் மற்றும் வெளியீட்டு செயல்முறை முழுவதும் நேரடித் தொடர்பு மற்றும் அர்ப்பணிப்புள்ள ஆதரவு.' },
          { title: 'உள்ளூர் சந்தை அறிவு', desc: 'தமிழ்நாடு முழுவதும் உள்ள வாடிக்கையாளர்களின் பழக்கவழக்கங்களுக்கு ஏற்ப வடிவமைக்கப்பட்ட பிரத்யேக விளம்பரம் மற்றும் வடிவமைப்பு உத்திகள்.' },
          { title: 'முழுமையான சேவை', desc: 'பாதுகாப்பான டொமைன் அமைப்பு முதல் அதிக வாடிக்கையாளர்களை ஈர்க்கும் டிஜிட்டல் விளம்பரங்கள் வரை அனைத்தையும் நாங்கள் நிர்வகிக்கிறோம்.' }
        ]
      };
      whyCards.forEach((card, idx) => {
        const trans = whyTranslations[lang][idx];
        if (trans) {
          const h3 = card.querySelector('h3');
          const p = card.querySelector('p');
          if (h3) h3.innerText = trans.title;
          if (p) p.innerText = trans.desc;
        }
      });

      // Projects section badges translation
      const liveProjectsBadge = document.getElementById('liveProjectsBadge');
      const ongoingProjectsBadge = document.getElementById('ongoingProjectsBadge');
      if (liveProjectsBadge) {
        liveProjectsBadge.innerHTML = `<span class="dot live-dot"></span> ${lang === 'ta' ? '2 செயல்பாட்டில் உள்ள தளங்கள்' : '2 Live & Hosted Sites'}`;
      }
      if (ongoingProjectsBadge) {
        ongoingProjectsBadge.innerHTML = `<span class="dot ongoing-dot"></span> ${lang === 'ta' ? '1 ஆன்லைன் குறியீட்டுப் பணியில்' : '1 Project in Active Development'}`;
      }

      // Projects section cards content translation
      const categories = document.querySelectorAll('.project-category');
      const categoryTexts = {
        en: ['E-Commerce & Pharmacy', 'Spiritual & Mutt Portal'],
        ta: ['மின்-வணிகம் & மருந்தகம்', 'ஆன்மீகம் & மடாலய தளம்']
      };
      categories.forEach((cat, idx) => {
        if (categoryTexts[lang][idx]) cat.innerText = categoryTexts[lang][idx];
      });

      const pTitles = document.querySelectorAll('.project-info h3');
      const pTitleTexts = {
        en: ['Anandham Marunthagam', 'Thulasibaba'],
        ta: ['ஆனந்தம் மருந்தகம்', 'துளசிபாபா']
      };
      pTitles.forEach((title, idx) => {
        if (pTitleTexts[lang][idx]) title.innerText = pTitleTexts[lang][idx];
      });

      const pDescs = document.querySelectorAll('.project-info p');
      const pDescTexts = {
        en: [
          'A custom digital pharmacy catalog built for seamless medicine browsing, local order request submissions, and prescriptions upload for local customers in Tamil Nadu.',
          'A dedicated portal for a private spiritual Mutt showcasing religious calendars, ashram activities, spiritual discourses, and community updates.'
        ],
        ta: [
          'இணையத்தில் மருந்து விவரங்களைக் காணவும், மருந்துச்சீட்டுகளைப் பதிவேற்றி ஆர்டர் செய்யவும் தமிழ்நாட்டு வாடிக்கையாளர்களுக்காக உருவாக்கப்பட்ட தளம்.',
          'தினசரி வழிபாட்டு காலண்டர், ஆன்மீக சொற்பொழிவுகள் மற்றும் மடத்தின் அறக்கட்டளை நடவடிக்கைகளைக் காட்சிப்படுத்தும் தளம்.'
        ]
      };
      pDescs.forEach((p, idx) => {
        if (pDescTexts[lang][idx]) p.innerText = pDescTexts[lang][idx];
      });

      const badges = document.querySelectorAll('.status-badge');
      const badgeTexts = {
        en: ['Live & Hosted', 'Live & Hosted'],
        ta: ['செயல்பாட்டில் உள்ளது', 'செயல்பாட்டில் உள்ளது']
      };
      badges.forEach((badge, idx) => {
        if (badgeTexts[lang][idx]) badge.innerText = badgeTexts[lang][idx];
      });

      const pLinks = document.querySelectorAll('.project-link');
      pLinks.forEach((link) => {
        link.innerHTML = `${lang === 'ta' ? 'தளத்தை பார்வையிட' : 'Visit Site'} <svg viewBox="0 0 24 24"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>`;
      });

      const processStepTitles = document.querySelectorAll('.process-step h3');
      const processStepPs = document.querySelectorAll('.process-step p');
      const processSteps = {
        en: {
          titles: ['Discuss', 'Design & Develop', 'Launch', 'Support & Grow'],
          texts: [
            'We align on your requirements, business goals, and map out the target project scope details.',
            'Our experts build highly custom layout concepts and secure custom-code structures.',
            'We optimize loading speed, run cross-browser compatibility tests, and deploy live on cloud servers.',
            'Continuous uptime tracking, routine backups, and targeted local ad campaigns.'
          ]
        },
        ta: {
          titles: ['ஆலோசித்தல்', 'வடிவமைப்பு & உருவாக்கம்', 'வெளியிடுதல்', 'ஆதரவு & வளர்ச்சி'],
          texts: [
            'உங்கள் தேவைகள், வணிக இலக்குகளை நாங்கள் புரிந்து கொண்டு, திட்டத்தின் எல்லையை வரையறுக்கிறோம்.',
            'எங்கள் நிபுணர்கள் தனிப்பயனாக்கப்பட்ட வடிவமைப்பு மற்றும் பாதுகாப்பான குறியீட்டு முறைகளை உருவாக்குகிறார்கள்.',
            'இணைய வேகத்தை மேம்படுத்தி, தரம் சோதித்து, பாதுகாப்பான கிளவுட் சர்வர்களில் வெளியிடுகிறோம்.',
            'தொடர்ச்சியான சர்வர் கண்காணிப்பு, வாராந்திர பேக்கப் மற்றும் விளம்பர பிரச்சாரங்களை மேற்கொள்கிறோம்.'
          ]
        }
      };
      processStepTitles.forEach((h3, idx) => {
        if (processSteps[lang].titles[idx]) h3.innerText = processSteps[lang].titles[idx];
      });
      processStepPs.forEach((p, idx) => {
        if (processSteps[lang].texts[idx]) p.innerText = processSteps[lang].texts[idx];
      });

      const ctaBandH2 = document.querySelector('.cta-band-content h2');
      const ctaBandP = document.querySelector('.cta-band-content p');
      if (ctaBandH2) ctaBandH2.innerText = lang === 'ta' ? 'உங்கள் வணிகத்தை இணையத்தில் வளர்க்க தயாரா?' : 'Ready to Grow Your Business Online?';
      if (ctaBandP) ctaBandP.innerText = lang === 'ta' ? 'உங்களது பட்ஜெட்டிற்கு ஏற்ற விரிவான திட்டத்தைப் பெற எங்களைத் தொடர்பு கொள்ளுங்கள்.' : 'Contact our experts to receive a comprehensive, obligation-free proposal tailored to your budget.';
    }

    // About Page specific elements (Founder Bio)
    if (currentPath === 'about.html') {
      const storyBadge = document.getElementById('storyBadge');
      const storyTitle = document.getElementById('storyTitle');
      const storyP1 = document.getElementById('storyP1');
      const storyHighlight = document.getElementById('storyHighlight');
      const storyP2 = document.getElementById('storyP2');

      if (storyBadge) {
        storyBadge.innerText = lang === 'ta' ? 'எங்கள் கதை' : 'Our Story';
      }
      if (storyTitle) {
        storyTitle.innerText = lang === 'ta' ? "தமிழ்நாட்டு நிறுவனங்களுக்கான தொழில்நுட்ப இடைவெளியைக் குறைத்தல்" : "Bridging the Technical Gap for Tamil Nadu's Enterprises";
      }
      if (storyP1) {
        storyP1.innerText = lang === 'ta'
          ? 'ஹெப்டாஜெனிக்ஸ் சொல்யூஷன்ஸ் ஒரு முக்கிய நோக்கத்துடன் தொடங்கப்பட்டது: தமிழ்நாடு முழுவதும் உள்ள சிறு மற்றும் நடுத்தர வணிகங்களுக்கு (SMEs) பாதுகாப்பான, உயர்தர மற்றும் மலிவான டிஜிட்டல் தளங்களை வழங்குவது. உள்ளூர் சில்லறை கடைகள், விநியோகஸ்தர்கள் மற்றும் ஸ்டார்ட்அப்கள் பெரும்பாலும் அதிக கட்டணம் வசூலிக்கும் பெரிய நகர நிறுவனங்களுக்கும் அல்லது அனுபவமற்ற தனிநபர்களுக்கும் இடையே தேர்வு செய்ய வேண்டிய கட்டாயத்தில் இருப்பதை நாங்கள் உணர்ந்தோம்.'
          : 'Heptagenix Solutions was established with a singular objective: to equip small and medium enterprises (SMEs) across Tamil Nadu with professional, highly secure, and affordable digital assets. We realized that local retail shops, distributors, private institutions, and startups were often forced to choose between overpriced urban agencies and inexperienced individuals.';
      }
      if (storyHighlight) {
        storyHighlight.innerText = lang === 'ta'
          ? '"பெரு நிறுவனங்களின் அதிகப்படியான கட்டணங்கள் இல்லாமல், அதிநவீன இணையதள அமைப்புகள் மற்றும் முடிவுகளைத் தரும் மார்க்கெட்டிங் சேவைகளை வழங்க எங்கள் குழு அர்ப்பணிப்புடன் செயல்படுகிறது."'
          : '"Our team is committed to delivering state-of-the-art web systems and result-driven marketing services without the corporate price tags."';
      }
      if (storyP2) {
        storyP2.innerText = lang === 'ta'
          ? 'தனிப்பயனாக்கப்பட்ட இணைய வடிவமைப்பு, நவீன வடிவமைப்பு வழிகாட்டுதல்கள் மற்றும் வெளிப்படையான தொடர்பு ஆகியவற்றைக் கலந்து, உங்கள் வணிகத்தின் ஒரு அங்கமாக நாங்கள் செயல்படுகிறோம். தொடர்ச்சியான ஆதரவு மற்றும் தரவு சார்ந்த சந்தைப்படுத்தல் ஆலோசனைகள் மூலம் நீண்டகால உறவுகளை உருவாக்குவதில் நாங்கள் நம்பிக்கை கொண்டுள்ளோம்.'
          : 'By blending custom engineering, modern design guidelines, and transparent communication, we act as a trusted extension of your business. We believe in building long-term relationships through continuous support and data-backed marketing advice.';
      }

      const founderRole = document.getElementById('founderRole');
      const founderName = document.getElementById('founderName');
      const founderBio1 = document.getElementById('founderBio1');
      const founderBio2 = document.getElementById('founderBio2');
      const linkedinBtn = document.getElementById('linkedinBtn');
      const portfolioBtn = document.getElementById('portfolioBtn');

      if (founderRole) {
        founderRole.innerText = lang === 'ta' ? 'நிறுவனர் & தலைமை நிர்வாக அதிகாரி (CEO)' : 'Founder & CEO';
      }
      if (founderName) {
        founderName.innerText = lang === 'ta' ? 'கார்த்திகேயன் ஈஸ்வரன்' : 'Karthikeyan Eswaran';
      }
      if (founderBio1) {
        founderBio1.innerText = lang === 'ta'
          ? 'ஹெப்டாஜெனிக்ஸ் சொல்யூஷன்ஸ் சார்பாக உங்களை வரவேற்கிறேன்! தமிழ்நாட்டின் சிறு வணிகங்களுக்கு அதிவேக இணையதள வடிவமைப்பு, தனிப்பயன் மென்பொருள் உருவாக்கம் மற்றும் மார்க்கெட்டிங் பிரச்சாரங்களை வழங்குவதற்காகவே இந்த டிஜிட்டல் நிறுவனத்தை நான் தொடங்கினேன்.'
          : 'Welcome to Heptagenix Solutions! As the Founder and CEO, I started this digital agency to bring high-performance web development, custom software engineering, and data-driven marketing campaigns to small businesses across Tamil Nadu.';
      }
      if (founderBio2) {
        founderBio2.innerText = lang === 'ta'
          ? 'எங்கள் நோக்கம் எளிமையானது: உள்ளூர் கடை உரிமையாளர்கள், பிராந்திய பிராண்டுகள் மற்றும் விநியோகஸ்தர்களுக்கு உலகத்தரம் வாய்ந்த டிஜிட்டல் சேவைகளை மலிவு விலையில் கிடைக்கச் செய்வது. தேவையற்ற டெம்ப்ளேட்களைப் பயன்படுத்தாமல், பிரத்யேக குறியீட்டு முறைகளைப் பயன்படுத்தி அதிவேக மற்றும் பாதுகாப்பான தளங்களை நாங்கள் வழங்குகிறோம்.'
          : 'Our mission is simple: to make enterprise-grade digital services accessible and affordable for local shop owners, regional brands, and rising distributors. By using custom-coded layouts instead of bloated, slow templates, we deliver fast, secure, and highly optimized platforms that establish authority and scale business leads.';
      }
      if (linkedinBtn) {
        linkedinBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> ${lang === 'ta' ? 'லிங்க்ட்இன் சுயவிவரம்' : 'LinkedIn Profile'}`;
      }
      if (portfolioBtn) {
        portfolioBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg> ${lang === 'ta' ? 'தனிப்பட்ட போர்ட்ஃபோலியோ' : 'Personal Portfolio'}`;
      }

      // 1. Translate Mission & Vision Cards
      const visionCards = document.querySelectorAll('.vision-card');
      const visionTranslations = {
        en: [
          { title: 'Our Mission', desc: 'To deliver robust, high-quality, and highly affordable web engineering and digital marketing systems to growing local enterprises throughout Tamil Nadu, enabling them to compete effectively in the modern global economy.' },
          { title: 'Our Vision', desc: "To build Tamil Nadu's most reliable and trusted digital growth agency, recognized for absolute transparent pricing structures, technical excellence, and deep-rooted support commitment for small businesses." }
        ],
        ta: [
          { title: 'எங்கள் நோக்கம்', desc: 'தமிழ்நாடு முழுவதும் உள்ள வளரும் உள்ளூர் நிறுவனங்களுக்கு வலுவான, உயர்தர மற்றும் மலிவான இணைய வடிவமைப்பு மற்றும் டிஜிட்டல் மார்க்கெட்டிங் அமைப்புகளை வழங்குதல்.' },
          { title: 'எங்கள் தொலைநோக்கு', desc: 'வெளிப்படையான கட்டண முறைகள் மற்றும் சிறந்த தொழில்நுட்பத்தின் மூலம் தமிழ்நாட்டின் நம்பகமான மற்றும் மதிப்புமிக்க டிஜிட்டல் ஏஜென்சியாக மாறுவது.' }
        ]
      };
      visionCards.forEach((card, idx) => {
        const trans = visionTranslations[lang][idx];
        if (trans) {
          const h3 = card.querySelector('h3');
          const p = card.querySelector('p');
          if (h3) h3.innerText = trans.title;
          if (p) p.innerText = trans.desc;
        }
      });

      // 2. Translate Section Headers (Core Values and Approach)
      const sectionHeaders = document.querySelectorAll('.section-header h2');
      const sectionTexts = document.querySelectorAll('.section-header p');
      if (sectionHeaders.length >= 2) {
        // Core Values
        sectionHeaders[0].innerText = lang === 'ta' ? 'எங்கள் முக்கிய விழுமியங்கள்' : 'Our Core Values';
        sectionTexts[0].innerText = lang === 'ta'
          ? 'இந்த அடிப்படைத் தரநிலைகள் எங்கள் பணி நெறிமுறைகள், செயல்படுத்தும் வழிகள் மற்றும் கிளையன்ட் தொடர்பு கொள்கைகளை நிர்வகிக்கின்றன.'
          : 'These underlying standards govern our work ethics, execution pathways, and client communication principles.';
        
        // Approach
        sectionHeaders[1].innerText = lang === 'ta' ? 'டிஜிட்டல் தீர்வுகளுக்கான எங்கள் அணுகுமுறை' : 'Our Approach to Digital Solutions';
        sectionTexts[1].innerText = lang === 'ta'
          ? 'உலகத்தரம் வாய்ந்த தரமான வெளியீடுகளைப் பேணும்போது, வரிசைப்படுத்தல் செலவுகளைக் குறைவாக வைத்திருக்க எங்கள் செயல்பாட்டு வழிகளை நாங்கள் கட்டமைக்கிறோம்.'
          : 'We structure our operational pathways to keep deployment costs low while maintaining world-class quality outputs.';
      }

      // 3. Translate Core Value Cards
      const valueCards = document.querySelectorAll('.value-card');
      const valueTranslations = {
        en: [
          { title: 'Affordability', desc: 'Structuring our services to deliver maximum return on investment without placing strain on small budgets.' },
          { title: 'High Quality', desc: 'Utilizing clean custom code structure and modern standards, never using bloated pre-built drag-and-drop themes.' },
          { title: 'Absolute Transparency', desc: 'Honest quotes, direct reporting, and zero hidden technical fees or unannounced upkeep costs.' },
          { title: 'Local Commitment', desc: "Deeply focused on the business growth of Tamil Nadu's towns and cities, offering local client care." }
        ],
        ta: [
          { title: 'மலிவு விலை', desc: 'சிறு பட்ஜெட்டுகளுக்கு சிரமம் ஏற்படுத்தாமல், அதிக லாபத்தை வழங்கும் வகையில் எங்கள் சேவைகளை வடிவமைக்கிறோம்.' },
          { title: 'உயர்ந்த தரம்', desc: 'சுத்தமான தனிப்பயன் குறியீட்டு முறைகளைப் பயன்படுத்துகிறோம், மெதுவான ரெடிமேட் டெம்ப்ளேட்டுகளை ஒருபோதும் பயன்படுத்துவதில்லை.' },
          { title: 'முழு வெளிப்படைத்தன்மை', desc: 'நேர்மையான கட்டண விவரங்கள், நேரடி அறிக்கையிடல் மற்றும் மறைமுக கட்டணங்கள் இல்லாத வெளிப்படையான சேவை.' },
          { title: 'உள்ளூர் அர்ப்பணிப்பு', desc: 'தமிழ்நாட்டின் நகரங்கள் மற்றும் கிராமப்புற வணிகங்களின் வளர்ச்சியில் தனி கவனம் செலுத்தி ஆதரவு வழங்குகிறோம்.' }
        ]
      };
      valueCards.forEach((card, idx) => {
        const trans = valueTranslations[lang][idx];
        if (trans) {
          const h3 = card.querySelector('h3');
          const p = card.querySelector('p');
          if (h3) h3.innerText = trans.title;
          if (p) p.innerText = trans.desc;
        }
      });

      // 4. Translate Approach Table
      const approachTable = document.querySelector('.approach-table');
      if (approachTable) {
        const headers = approachTable.querySelectorAll('th');
        if (headers.length >= 3) {
          headers[0].innerText = lang === 'ta' ? 'கவனம் செலுத்தும் பகுதி' : 'Focus Area';
          headers[1].innerText = lang === 'ta' ? 'ஹெப்டாஜெனிக்ஸ் சொல்யூஷன்ஸ் அணுகுமுறை' : 'Heptagenix Solutions Approach';
          headers[2].innerText = lang === 'ta' ? 'வழக்கமான ஏஜென்சிகள்' : 'Traditional Agencies';
        }

        const rows = approachTable.querySelectorAll('tbody tr');
        const rowTranslations = {
          en: [
            {
              focus: 'Code Integrity',
              heptagenix: '<span class="approach-badge"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Custom Vanilla HTML5/CSS3/JS</span><br>Ultra-light, secure code built for speed.',
              traditional: '<strong>Bloated Theme Builders</strong><br>Slow load speeds, visual templates, security issues.'
            },
            {
              focus: 'Cost Structure',
              heptagenix: '<span class="approach-badge"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Budget-Friendly Flat Fee</span><br>Highly optimized low-overhead structures suited for small budgets.',
              traditional: '<strong>Heavy Retainer Models</strong><br>Expensive setup fees, complex contracts, high support costs.'
            },
            {
              focus: 'Customer Service',
              heptagenix: '<span class="approach-badge"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Direct Technical Consultation</span><br>Direct calls with experts. Prompt resolution of issues.',
              traditional: '<strong>Sales Account Managers</strong><br>Confusing tech terms, slow support ticketing systems.'
            },
            {
              focus: 'Local Market Context',
              heptagenix: '<span class="approach-badge"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Tamil Nadu Specialized Insights</span><br>Deep regional business understanding and bilingual capability support.',
              traditional: '<strong>Generic Layouts</strong><br>Templates built without regional user habits or regional language localization.'
            }
          ],
          ta: [
            {
              focus: 'குறியீட்டுத் தரம்',
              heptagenix: '<span class="approach-badge"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> தனிப்பயன் குறியீட்டு முறை</span><br>வேகத்திற்காக உருவாக்கப்பட்ட அதிவேக, பாதுகாப்பான குறியீடு.',
              traditional: '<strong>ரெடிமேட் தீம் பில்டர்கள்</strong><br>மெதுவான வேகம், குறியீட்டு பிழைகள் மற்றும் பாதுகாப்பு சிக்கல்கள்.'
            },
            {
              focus: 'கட்டண முறை',
              heptagenix: '<span class="approach-badge"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> மலிவான நிலையான கட்டணம்</span><br>சிறு பட்ஜெட்டுகளுக்கு உகந்த குறைந்த செயல்பாட்டுச் செலவு முறை.',
              traditional: '<strong>அதிக மாதாந்திர கட்டணங்கள்</strong><br>அதிக முன்பணம், சிக்கலான ஒப்பந்தங்கள் மற்றும் கூடுதல் கட்டணங்கள்.'
            },
            {
              focus: 'வாடிக்கையாளர் சேவை',
              heptagenix: '<span class="approach-badge"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> நேரடித் தொடர்பு மற்றும் தீர்வு</span><br>நிபுணர்களுடன் நேரடித் தொடர்பு மற்றும் உடனுக்குடன் தீர்வுகள்.',
              traditional: '<strong>விற்பனை கணக்கு மேலாளர்கள்</strong><br>புரியாத தொழில்நுட்ப வார்த்தைகள் மற்றும் மெதுவான ஆதரவு முறை.'
            },
            {
              focus: 'உள்ளூர் சந்தை சூழல்',
              heptagenix: '<span class="approach-badge"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> தமிழ்நாட்டிற்கான பிரத்யேக உத்திகள்</span><br>உள்ளூர் சந்தை அறிவு மற்றும் இருமொழி ஆதரவு திறன்.',
              traditional: '<strong>பொதுவான வடிவமைப்புகள்</strong><br>உள்ளூர் வாடிக்கையாளர் பழக்கவழக்கங்கள் அல்லது தமிழ் மொழிபெயர்ப்பு இல்லாத தளங்கள்.'
            }
          ]
        };

        rows.forEach((row, idx) => {
          const trans = rowTranslations[lang][idx];
          if (trans) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
              cells[0].innerText = trans.focus;
              cells[1].innerHTML = trans.heptagenix;
              cells[2].innerHTML = trans.traditional;
            }
          }
        });
      }
    }

    // Contact Page specific elements
    if (currentPath === 'contact.html') {
      const contactH2 = document.querySelector('.contact-card h2');
      const contactP = document.querySelector('.contact-card p');
      const googleFormBtnText = document.getElementById('googleFormBtnText');

      if (contactH2) {
        contactH2.innerText = lang === 'ta' ? 'விசாரணை அனுப்பவும்' : 'Send Us an Inquiry';
      }
      if (contactP) {
        contactP.innerText = lang === 'ta'
          ? 'எங்கள் விசாரணை படிவத்தை நிரப்ப கீழே உள்ள பொத்தானைக் கிளிக் செய்யவும், 24 மணி நேரத்திற்குள் உங்களைத் தொடர்பு கொள்கிறோம்.'
          : 'Please click the button below to fill out our inquiry form and receive a customized digital proposal within 24 hours.';
      }
      if (googleFormBtnText) {
        googleFormBtnText.innerText = lang === 'ta' ? 'விசாரணை படிவத்தை நிரப்பவும்' : 'Fill Inquiry Form';
      }

      const detailsH3 = document.querySelector('.info-details-card h3');
      if (detailsH3) detailsH3.innerText = lang === 'ta' ? 'தொடர்பு விவரங்கள்' : 'Contact Details';

      const detailsTitles = document.querySelectorAll('.info-details-text h4');
      const detailsTexts = {
        en: ['Phone Support', 'Email Address', 'WhatsApp Chat', 'Service Region'],
        ta: ['தொலைபேசி ஆதரவு', 'மின்னஞ்சல் முகவரி', 'வாட்ஸ்அப் அரட்டை', 'சேவை மண்டலம்']
      };
      detailsTitles.forEach((h4, idx) => {
        if (detailsTexts[lang][idx]) h4.innerText = detailsTexts[lang][idx];
      });

      const detailsP4 = document.querySelector('.info-details-list .info-details-item:nth-child(4) p');
      if (detailsP4) detailsP4.innerText = lang === 'ta' ? 'தமிழ்நாட்டின் அனைத்து மாவட்டங்களிலும் உள்ள வணிகங்களுக்கு சேவையாற்றுகிறோம்.' : 'Proudly serving businesses across all districts of Tamil Nadu.';

      const faqAccordion = document.querySelector('.faq-accordion');
      if (faqAccordion) {
        const faqSection = faqAccordion.closest('.section');
        if (faqSection) {
          const faqH2 = faqSection.querySelector('.section-header h2');
          const faqP = faqSection.querySelector('.section-header p.text-muted');
          if (faqH2) faqH2.innerText = lang === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Contact FAQ';
          if (faqP) faqP.innerText = lang === 'ta' 
            ? 'எங்கள் ஆலோசனை கட்டணங்கள் மற்றும் பதிலளிக்கும் நேரங்கள் பற்றிய பொதுவான கேள்விகள்.' 
            : 'Answering queries regarding our consultation rates and response times.';
        }

        const contactFaqData = {
          en: [
            {
              q: 'Is the initial project consultation session free?',
              a: 'Yes. Our initial phone consultation and project scoping session is 100% free with no commercial obligations. We will review your goals and provide a transparent project roadmap.'
            },
            {
              q: 'How quickly does your team respond to form requests?',
              a: 'We review form requests continuously. A technical consultant will contact you via phone or email within 24 business hours.'
            },
            {
              q: 'Can we arrange an in-person meeting for project details?',
              a: 'We manage operations online via phone, WhatsApp, and Google Meet to keep overhead costs low and pass savings to clients. For larger enterprise setups, we can schedule on-site team meetings.'
            }
          ],
          ta: [
            {
              q: 'தொடக்க கட்ட ஆலோசனை அமர்வு இலவசமா?',
              a: 'ஆம். எங்களது முதல் தொலைபேசி ஆலோசனை மற்றும் திட்ட வடிவமைப்பு முற்றிலும் இலவசம். இதில் எந்தவொரு மறைமுக கட்டணங்களோ அல்லது ஒப்பந்தங்களோ கிடையாது.'
            },
            {
              q: 'படிவத்தை நிரப்பிய பிறகு உங்களைத் தொடர்பு கொள்ள எவ்வளவு நேரம் ஆகும்?',
              a: 'நாங்கள் படிவங்களை தொடர்ந்து கண்காணித்து வருகிறோம். எங்கள் தொழில்நுட்ப ஆலோசகர் 24 வேலை நேரத்திற்குள் உங்களை தொலைபேசி அல்லது மின்னஞ்சல் மூலம் தொடர்பு கொள்வார்.'
            },
            {
              q: 'நாங்கள் உங்களை நேரில் சந்தித்துப் பேச முடியுமா?',
              a: 'செலவுகளைக் குறைத்து அந்தப் பலன்களை எங்களுடைய வாடிக்கையாளர்களுக்கு வழங்க, நாங்கள் தொலைபேசி, வாட்ஸ்அப் மற்றும் கூகுள் மீட் மூலம் ஆன்லைனில் சேவையாற்றுகிறோம். பெரிய அளவிலான திட்டங்களுக்கு நேரில் சந்திப்பதற்கான ஏற்பாடுகளையும் செய்கிறோம்.'
            }
          ]
        };

        const faqItems = faqAccordion.querySelectorAll('.faq-item');
        faqItems.forEach((item, idx) => {
          const faqData = contactFaqData[lang][idx];
          if (faqData) {
            const h3 = item.querySelector('.faq-header h3');
            const content = item.querySelector('.faq-content');
            if (h3) h3.innerText = faqData.q;
            if (content) content.innerText = faqData.a;
          }
        });
      }
    }

    // Pricing Page specific elements
    if (currentPath === 'pricing.html') {
      const priceTranslations = {
        'pricing.html': {
          en: {
            heroH1: 'Simple, Transparent Pricing Plans',
            crumb: 'Pricing',
            mainTitle: 'Select a Package That Matches Your Goals',
            mainSub: "No hidden upkeep charges, no complicated technical clauses. Choose a flat pricing tier built for Tamil Nadu's small business budgets.",
            tiers: [
              {
                title: 'Starter Digital',
                desc: 'Perfect for retail showrooms and local services establishing their online presence.',
                price: '4,999',
                period: '/one-time',
                note: 'Launch Offer, normally ₹7,999',
                features: [
                  { text: '5 Custom-Coded Pages' },
                  { text: 'Mobile-First Responsive Layout' },
                  { text: 'Free SSL Security Certificate' },
                  { text: 'Google Maps Profile Link' },
                  { text: '1 Year Support' },
                  { text: 'On-page SEO Optimization' },
                  { text: 'Paid Ad Lead Campaigns' }
                ],
                btn: 'Get Started'
              },
              {
                title: 'Business Growth',
                badge: 'Most Popular',
                desc: 'Optimized for regional distributors, showrooms, and service desks seeking active leads.',
                price: '3,500-5,000',
                period: '/mo',
                note: 'Monthly retainer billing',
                features: [
                  { text: '10 Custom-Coded Pages' },
                  { text: 'Local SEO Setup & Optimization' },
                  { text: 'Google Business Profile Rank Campaign' },
                  { text: 'Weekly Remote Backups' },
                  { text: 'Monthly Search Performance Report' },
                  { text: '1 Year Support' },
                  { text: 'Meta/Google Ads Setup & Management' }
                ],
                btn: 'Start Growth Plan'
              },
              {
                title: 'Premium Enterprise',
                desc: 'A complete database application, hosting package, and marketing setup to scale.',
                price: 'Custom Quote',
                period: '',
                note: 'Monthly billing',
                features: [
                  { text: 'Custom Full Stack Application' },
                  { text: 'Complete Admin Portals & DB Setup' },
                  { text: 'Google & Meta Ad Campaign Setup' },
                  { text: 'Dedicated Hosting & 24/7 Monitoring' },
                  { text: 'Bilingual Copywriting & Poster Design' },
                  { text: '1 Year Support' },
                  { text: 'Continuous Maintenance & Priority support' }
                ],
                btn: 'Request Custom Quote'
              }
            ],
            summaryTitle: 'Pricing Summary',
            summaryHeaders: ['Tier', 'Price', 'Billing'],
            summaryRows: [
              ['Starter Digital', '₹4,999 <span style="color: var(--accent-gold); font-weight: 600; font-style: italic;">(Launch Offer, normally ₹7,999)</span>', 'One-time'],
              ['Business Growth', '₹3,500–₹5,000/month', 'Monthly retainer'],
              ['Premium Enterprise', 'Custom Quote', 'Monthly']
            ],
            customTitle: 'Looking for a completely custom package?',
            customText: 'We tailor our digital engineering, marketing plans, and database configurations to match the exact requirements of your business.',
            customLink: 'Contact us for a custom scope session →'
          },
          ta: {
            heroH1: 'எளிமையான, வெளிப்படையான கட்டணத் திட்டங்கள்',
            crumb: 'விலைப்பட்டியல்',
            mainTitle: 'உங்கள் இலக்குகளுக்குப் பொருத்தமான திட்டத்தைத் தேர்ந்தெடுக்கவும்',
            mainSub: 'எந்தவொரு மறைமுகக் கட்டணங்களும் இல்லை. தமிழ்நாட்டின் சிறு வணிக பட்ஜெட்டுகளுக்கு ஏற்ற எளிமையான கட்டணங்கள்.',
            tiers: [
              {
                title: 'ஸ்டார்ட்டர் டிஜிட்டல்',
                desc: 'ஆன்லைனில் தங்கள் இருப்பை உருவாக்க விரும்பும் சில்லறை விற்பனையாளர்கள் மற்றும் உள்ளூர் சேவைகளுக்கு ஏற்றது.',
                price: '4,999',
                period: '/ஒரு முறை',
                note: 'அறிமுக சலுகை, வழக்கமான விலை ₹7,999',
                features: [
                  { text: '5 பிரத்யேக இணையப் பக்கங்கள்' },
                  { text: 'மொபைலுக்கு உகந்த வடிவமைப்பு' },
                  { text: 'இலவச SSL பாதுகாப்பு சான்றிதழ்' },
                  { text: 'கூகுள் மேப் சுயவிவர இணைப்பு' },
                  { text: '1 வருட ஆதரவு' },
                  { text: 'இணையப் பக்க SEO மேம்பாடு' },
                  { text: 'விளம்பர பிரச்சாரங்கள்' }
                ],
                btn: 'தொடங்கவும்'
              },
              {
                title: 'பிசினஸ் குரோத்',
                badge: 'மிகவும் பிரபலம்',
                desc: 'வாடிக்கையாளர் விசாரணைகளை அதிகரிக்க விரும்பும் விநியோகஸ்தர்கள் மற்றும் கடைகளுக்கு ஏற்றது.',
                price: '3,500-5,000',
                period: '/மாதம்',
                note: 'மாதாந்திர கட்டணம்',
                features: [
                  { text: '10 பிரத்யேக இணையப் பக்கங்கள்' },
                  { text: 'உள்ளூர் SEO அமைவு & உகப்பாக்கம்' },
                  { text: 'கூகுள் பிசினஸ் புரொஃபைல் முன்னிலைப்படுத்துதல்' },
                  { text: 'வாராந்திர தானியங்கி பேக்கப்' },
                  { text: 'மாதாந்திர தேடல் செயல்திறன் அறிக்கை' },
                  { text: '1 வருட ஆதரவு' },
                  { text: 'மெட்டா/கூகுள் விளம்பர மேலாண்மை' }
                ],
                btn: 'குரோத் திட்டத்தைத் தொடங்க'
              },
              {
                title: 'பிரீமியம் என்டர்பிரைஸ்',
                desc: 'முழுமையான வலைச் செயலி, ஹோஸ்டிங் மற்றும் மார்க்கெட்டிங் தேவைப்படும் பெரிய வணிகங்களுக்கு ஏற்றது.',
                price: 'தனிப்பயன் விலை',
                period: '',
                note: 'மாதாந்திர பில்லிங்',
                features: [
                  { text: 'முழுமையான தனிப்பயன் வலைச் செயலி' },
                  { text: 'நிர்வாக டாஷ்போர்டு & தரவுத்தளம் அமைத்தல்' },
                  { text: 'கூகுள் & மெட்டா விளம்பரப் பிரச்சாரம்' },
                  { text: 'பிரத்யேக ஹோஸ்டிங் & 24/7 கண்காணிப்பு' },
                  { text: 'இருமொழி வடிவமைப்பு & போஸ்டர்கள்' },
                  { text: '1 வருட ஆதரவு' },
                  { text: 'தொடர் பராமரிப்பு & முன்னுரிமை ஆதரவு' }
                ],
                btn: 'விலை விவரம் கேட்க'
              }
            ],
            summaryTitle: 'கட்டணங்களின் சுருக்கம்',
            summaryHeaders: ['திட்டம்', 'விலை', 'பில்லிங் முறை'],
            summaryRows: [
              ['ஸ்டார்ட்டர் டிஜிட்டல்', '₹4,999 (அறிமுக சலுகை, வழக்கமான விலை ₹7,999)', 'ஒரு முறை செலுத்துதல்'],
              ['பிசினஸ் குரோத்', '₹3,500–₹5,000/மாதம்', 'மாதாந்திர சந்தா'],
              ['பிரீமியம் என்டர்பிரைஸ்', 'தனிப்பயன் விலை விவரம்', 'மாதாந்திர பில்லிங்']
            ],
            customTitle: 'முழுமையான தனிப்பயன் திட்டம் வேண்டுமா?',
            customText: 'உங்கள் வணிகத்தின் தேவைகளுக்கு ஏற்ப டிஜிட்டல் மென்பொருள்கள், விளம்பரத் திட்டங்கள் மற்றும் தரவுத்தளங்களை நாங்கள் வடிவமைக்கிறோம்.',
            customLink: 'கூடுதல் விவரங்களுக்கு எங்களைத் தொடர்பு கொள்ளவும் →'
          }
        }
      };

      const data = priceTranslations['pricing.html'][lang];
      if (data) {
        const heroH1 = document.querySelector('.hero-content h1');
        if (heroH1) heroH1.innerText = data.heroH1;
        const breadcrumbs = document.querySelectorAll('.breadcrumb a, .breadcrumb span');
        if (breadcrumbs.length >= 3) {
          breadcrumbs[0].innerText = lang === 'ta' ? 'முகப்பு' : 'Home';
          breadcrumbs[2].innerText = data.crumb;
        }

        const sectionH2 = document.querySelector('.section-header h2');
        const sectionP = document.querySelector('.section-header p.text-muted');
        if (sectionH2) sectionH2.innerText = data.mainTitle;
        if (sectionP) sectionP.innerText = data.mainSub;

        const pricingCards = document.querySelectorAll('.pricing-card');
        pricingCards.forEach((card, idx) => {
          const tierData = data.tiers[idx];
          if (tierData) {
            const h3 = card.querySelector('h3');
            if (h3) h3.innerText = tierData.title;

            const desc = card.querySelector('.pricing-desc');
            if (desc) desc.innerText = tierData.desc;

            const val = card.querySelector('.pricing-price .value');
            const period = card.querySelector('.pricing-price .period');
            const note = card.querySelector('.pricing-price .price-note');
            if (val) {
              val.innerText = tierData.price;
              if (tierData.price === 'Custom Quote' || tierData.price === 'தனிப்பயன் விலை') {
                val.style.fontSize = '2.1rem';
              } else {
                val.style.fontSize = '';
              }
            }
            if (period) period.innerText = tierData.period;
            if (note) note.innerText = tierData.note;

            if (tierData.badge) {
              const badge = card.querySelector('.pricing-badge');
              if (badge) badge.innerText = tierData.badge;
            }

            const featureSpans = card.querySelectorAll('.pricing-features-list li span');
            featureSpans.forEach((span, fIdx) => {
              if (tierData.features[fIdx]) {
                span.innerText = tierData.features[fIdx].text;
              }
            });

            const btn = card.querySelector('a.btn');
            if (btn) btn.innerText = tierData.btn;
          }
        });

        const tableH3 = document.querySelector('.pricing-table-container h3');
        if (tableH3) tableH3.innerText = data.summaryTitle;

        const tableHeaders = document.querySelectorAll('.approach-table th');
        tableHeaders.forEach((th, idx) => {
          if (data.summaryHeaders[idx]) th.innerText = data.summaryHeaders[idx];
        });

        const tableRows = document.querySelectorAll('.approach-table tbody tr');
        tableRows.forEach((row, rIdx) => {
          const rowData = data.summaryRows[rIdx];
          if (rowData) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
              cells[0].innerText = rowData[0];
              cells[1].innerHTML = rowData[1];
              cells[2].innerText = rowData[2];
            }
          }
        });

        const contextH4 = document.querySelector('.pricing-context-box h4');
        const contextP = document.querySelector('.pricing-context-box p');
        if (contextH4) contextH4.innerText = data.customTitle;
        if (contextP) {
          contextP.innerHTML = `${data.customText} <a href="contact.html" style="color: var(--accent-gold); font-weight: 600; text-decoration: underline; margin-left: 8px;">${data.customLink}</a>`;
        }
      }
    }

    // Service Pages specific elements
    const servicePages = [
      'web-development.html',
      'hosting-maintenance.html',
      'seo-optimization.html',
      'fullstack-applications.html',
      'social-media-management.html',
      'ad-marketing.html'
    ];

    if (servicePages.includes(currentPath)) {
      const serviceTranslations = {
        'web-development.html': {
          en: {
            heroH1: 'Web Development Services',
            crumb: 'Web Development',
            mainTitle: 'Custom Web Engineering For Modern Brands',
            mainSub: 'A premium website is the foundation of your digital sales channel. We build bespoke corporate sites that load fast, look professional, and turn visitors into enquiries.',
            desc: 'Many design agencies rely on heavy, generic templates that slow down load speeds and leave security vulnerabilities. At Heptagenix Solutions, we write clean HTML5, CSS3, and JavaScript, meaning your website loads instantly, operates smoothly across all platforms, and stands out from standard templates.',
            includedTitle: "What's Included in this Service",
            features: [
              { title: 'Responsive Design', desc: 'Perfect rendering on mobile displays, tablets, laptops, and wide screens.' },
              { title: 'Speed Optimization', desc: 'Engineered for lightweight fast loading, securing core search rank gains.' },
              { title: 'Custom UI/UX', desc: 'Modern structures, premium typography, and clean corporate navy details.' },
              { title: 'E-Commerce Power', desc: 'Integrate catalog displays, checkout carts, and secure payment setups.' }
            ],
            whoTitle: 'Who This Is For',
            whoDesc: 'Our custom web development model is optimized specifically for growing businesses across Tamil Nadu looking to scale their customer base, including:',
            whoBullets: [
              'Retail showrooms (Textiles, Jewellery, Furniture, Electronics)',
              'Manufacturing and export firms seeking professional credibility',
              'Private educational institutes, hospitals, and clinical labs',
              'Service consultancies, logistics partners, and local startups'
            ],
            whoBtn: 'Request Website Quote',
            processTitle: 'Our Development Process',
            processSub: 'How we translate your requirements into a custom-engineered business website.',
            processSteps: [
              { title: 'Wireframe Design', desc: 'We sketch layouts to map the visual structure and placement of conversion items.' },
              { title: 'Vanilla Coding', desc: 'Writing responsive HTML5, structural CSS variables, and interactive JS controls.' },
              { title: 'Speed Auditing', desc: 'Compressing assets, cleaning code directories, and checking performance metrics.' },
              { title: 'Domain Launch', desc: 'Deploying onto secure cloud hostings, activating free SSLs, and submitting indexing maps.' }
            ],
            faqTitle: 'Web Development FAQ',
            faqSub: 'Common questions about our coding standards, delivery times, and ownership.',
            faqs: [
              { q: 'Do you use WordPress or generic web design builders?', a: 'No. We write clean, custom HTML, CSS, and vanilla JS. This makes your site significantly faster (loading under 2 seconds), highly secure against hacker attacks, and fully customizable without visual template limitations.' },
              { q: 'Will the website load fast on mobile devices in smaller towns?', a: 'Yes. Lightweight assets, compressed responsive images, inline SVG icons, and premium server setup ensure that your website loads rapidly even on standard 3G/4G connections across Tamil Nadu.' },
              { q: 'Who owns the website and domain name?', a: 'You do. We help set up the domain registry and cloud space, but everything is registered under your business name. If you decide to move hosting in the future, you take all assets with you.' },
              { q: 'How long does it take to deploy a standard company website?', a: 'A professional corporate profile site (5-7 pages) takes approximately 2 to 3 weeks. E-commerce catalogues or custom systems take 4 to 6 weeks, depending on dynamic feature configurations.' }
            ],
            crossTitle: 'You May Also Need These Services',
            crossCards: [
              { title: 'Hosting & Maintenance', desc: 'Keep your custom site secure, patched, backed up weekly, and running on premium speed-optimized local cloud servers.', link: 'Go to Hosting & Maintenance' },
              { title: 'SEO Optimization', desc: 'Climb search rankings on Google for local Tamil Nadu searches and direct targeted customer calls straight to your office.', link: 'Go to SEO Optimization' }
            ],
            ctaTitle: 'Need a Custom, High-Performance Corporate Website?',
            ctaDesc: 'Get in touch for a detailed, no-obligation quote matching your budget goals.',
            ctaBtn: 'Schedule Consultation'
          },
          ta: {
            heroH1: 'இணையதள வடிவமைப்பு சேவைகள்',
            crumb: 'இணையதள வடிவமைப்பு',
            mainTitle: 'நவீன பிராண்டுகளுக்கான தனிப்பயன் இணைய வடிவமைப்பு',
            mainSub: 'ஒரு தரமான இணையதளம் உங்கள் டிஜிட்டல் விற்பனைக்கான அடித்தளமாகும். நாங்கள் வேகமான, தொழில்முறைத் தோற்றம் கொண்ட மற்றும் வாடிக்கையாளர்களை ஈர்க்கும் இணையதளங்களை உருவாக்குகிறோம்.',
            desc: 'பல வடிவமைப்பு நிறுவனங்கள் உங்கள் இணையதளத்தின் வேகத்தைக் குறைக்கும் மற்றும் பாதுகாப்பு அற்ற பொதுவான ரெடிமேட் டெம்ப்ளேட்களைப் பயன்படுத்துகின்றன. ஹெப்டாஜெனிக்ஸ் சொல்யூஷன்ஸில், நாங்கள் சுத்தமான HTML5, CSS3 மற்றும் ஜாவாஸ்கிரிப்ட் குறியீடுகளைப் பயன்படுத்தி, உங்கள் இணையதளம் உடனடியாக லோட் ஆகவும், பாதுகாப்பாகவும் இருப்பதை உறுதி செய்கிறோம்.',
            includedTitle: 'இந்த சேவையில் சேர்க்கப்பட்டுள்ளவை',
            features: [
              { title: 'ரெஸ்பான்சிவ் வடிவமைப்பு', desc: 'மொபைல், டேப்லெட், லேப்டாப் மற்றும் பெரிய திரைகளில் கச்சிதமாகத் தோன்றும் வடிவமைப்பு.' },
              { title: 'வேக மேம்பாடு', desc: 'இணையதளம் மிக வேகமாக லோட் ஆவதற்கும், கூகுள் தேடல் தரவரிசையில் முன்னிலைப் பெறவும் வழிவகை செய்தல்.' },
              { title: 'தனிப்பயன் UI/UX', desc: 'நவீன கட்டமைப்பு, பிரீமியம் எழுத்துருக்கள் மற்றும் நேர்த்தியான கார்ப்பரேட் வடிவமைப்பு விவரங்கள்.' },
              { title: 'மின்-வணிக ஆதரவு', desc: 'தயாரிப்புகளின் காட்சி, செக்அவுட் கார்ட் மற்றும் பாதுகாப்பான கட்டண அமைப்புகளை இணைத்தல்.' }
            ],
            whoTitle: 'இது யாருக்கானது',
            whoDesc: 'எங்கள் தனிப்பயன் இணைய வடிவமைப்பு மாதிரி தமிழ்நாடு முழுவதும் வளரும் வணிகங்களுக்காக சிறப்பாக வடிவமைக்கப்பட்டுள்ளது, இதில் அடங்குபவை:',
            whoBullets: [
              'சில்லறை விற்பனை நிலையங்கள் (ஜவுளி, நகைகள், மரச்சாமான்கள், எலக்ட்ரானிக்ஸ்)',
              'தொழில்முறை நம்பகத்தன்மையை விரும்பும் உற்பத்தி மற்றும் ஏற்றுமதி நிறுவனங்கள்',
              'தனியார் கல்வி நிறுவனங்கள், மருத்துவமனைகள் மற்றும் ஆய்வகங்கள்',
              'சேவை ஆலோசனைகள், தளவாட கூட்டாளர்கள் மற்றும் உள்ளூர் ஸ்டார்ட்அப்கள்'
            ],
            whoBtn: 'இணையதளத்திற்கான விலை விவரம் பெற',
            processTitle: 'எங்கள் வடிவமைப்பு செயல்முறை',
            processSub: 'உங்கள் தேவைகளை நாங்கள் எவ்வாறு ஒரு தொழில்முறை வணிக இணையதளமாக மாற்றுகிறோம்.',
            processSteps: [
              { title: 'வரைபட வடிவமைப்பு', desc: 'இணையதளத்தின் காட்சி அமைப்பு மற்றும் கூறுகளைத் திட்டமிடுவதற்கான வரைபட வடிவமைப்பு.' },
              { title: 'முறையான குறியீட்டு முறை', desc: 'வேகமான, பாதுகாப்பான HTML5, CSS மாறிகள் மற்றும் ஊடாடும் JS குறியீடுகளை எழுதுதல்.' },
              { title: 'வேக சோதனை', desc: 'கோப்புகளைச் சுருக்கி, குறியீட்டைச் சுத்தப்படுத்தி, இணையதளத்தின் செயல்திறனைச் சரிபார்த்தல்.' },
              { title: 'இணையதள வெளியீடு', desc: 'பாதுகாப்பான கிளவுட் ஹோஸ்டிங்கில் பதிவேற்றி, இலவச SSL சான்றிதழுடன் வெளியிடுதல்.' }
            ],
            faqTitle: 'இணையதள வடிவமைப்பு - அடிக்கடி கேட்கப்படும் கேள்விகள்',
            faqSub: 'எங்கள் குறியீட்டு தரம், டெலிவரி நேரம் மற்றும் உரிமம் பற்றிய பொதுவான கேள்விகள்.',
            faqs: [
              { q: 'நீங்கள் வேர்ட்பிரஸ் அல்லது பிற ரெடிமேட் பில்டர்களைப் பயன்படுத்துகிறீர்களா?', a: 'இல்லை. நாங்கள் பிரத்யேகமாக புதிதாக குறியீடு எழுதுகிறோம். இது உங்கள் தளம் வேகமாகவும் (2 வினாடிகளுக்குள் லோட் ஆகும்), ஹேக்கர்களிடமிருந்து பாதுகாப்பாகவும் இருக்க உதவுகிறது.' },
              { q: 'சிறு நகரங்களில் உள்ள மொபைல் போன்களிலும் இணையதளம் வேகமாக லோட் ஆகுமா?', a: 'ஆம். இலகுவான கோப்புகள், கம்ப்ரஸ் செய்யப்பட்ட படங்கள் மற்றும் சிறந்த சர்வர் அமைப்பு போன்றவற்றால் 3G/4G நெட்வொர்க்கிலும் தளம் வேகமாக இயங்கும்.' },
              { q: 'இணையதளம் மற்றும் டொமைன் பெயரின் உரிமையாளர் யார்?', a: 'நீங்கள் தான். டொமைன் மற்றும் கிளவுட் ஸ்பேஸ் அமைக்க நாங்கள் உதவுகிறோம், ஆனால் அனைத்தும் உங்கள் வணிக பெயரிலேயே பதிவு செய்யப்படும்.' },
              { q: 'ஒரு சாதாரண வணிக இணையதளத்தை உருவாக்க எவ்வளவு நேரம் ஆகும்?', a: 'ஒரு தொழில்முறை நிறுவன இணையதளம் (5-7 பக்கங்கள்) அமைக்க சுமார் 2 முதல் 3 வாரங்கள் ஆகும். மின்-வணிக தளங்களுக்கு 4 முதல் 6 வாரங்கள் வரை ஆகலாம்.' }
            ],
            crossTitle: 'உங்களுக்கு இந்த சேவைகளும் தேவைப்படலாம்',
            crossCards: [
              { title: 'ஹோஸ்டிங் & பராமரிப்பு', desc: 'உங்கள் தளத்தை பாதுகாப்பாக வைத்திருக்கவும், வாராந்திர பேக்கப் எடுக்கவும் மற்றும் அதிவேக கிளவுட் சர்வர்களில் இயக்கவும்.', link: 'ஹோஸ்டிங் & பராமரிப்பு பகுதிக்குச் செல்ல' },
              { title: 'தேடுபொறி உகப்பாக்கம் (SEO)', desc: 'கூகுள் தேடலில் உங்கள் வணிகத்தை முதலிடத்திற்கு கொண்டு வரவும் மற்றும் நேரடி வாடிக்கையாளர் அழைப்புகளைப் பெறவும்.', link: 'SEO பகுதிக்குச் செல்ல' }
            ],
            ctaTitle: 'தனிப்பயன், அதிவேக நிறுவன இணையதளம் வேண்டுமா?',
            ctaDesc: 'உங்கள் பட்ஜெட்டிற்கு ஏற்றவாறு விரிவான விலை விவரங்களைப் பெற எங்களைத் தொடர்பு கொள்ளுங்கள்.',
            ctaBtn: 'ஆலோசனை பெற'
          }
        },
        'hosting-maintenance.html': {
          en: {
            heroH1: 'Hosting & Maintenance Services',
            crumb: 'Hosting & Maintenance',
            mainTitle: 'Worry-Free Cloud Hosting & Support',
            mainSub: 'A beautiful website is only useful if it remains online and secure. We handle all hosting, server maintenance, backup schedules, and configuration updates so you can focus on running your business.',
            desc: 'Setting up servers, mapping domains, configuring SSL security certificates, and handling data backups can be complex. If done incorrectly, your site could experience slow load times, data loss, or server errors. Our hosting plans deploy your files on highly optimized, modern cloud servers with continuous monitoring.',
            includedTitle: "What's Included in this Service",
            features: [
              { title: 'Cloud Web Hosting', desc: 'High-speed SSD servers ensuring minimal loading latency and stable performance.' },
              { title: 'Continuous Security', desc: 'Active web application firewalls and daily malware monitoring blocks threats.' },
              { title: 'Weekly Backups', desc: 'Weekly backups protect your website files, database entries, and product catalogs.' },
              { title: 'Routine Content Edits', desc: 'All plans include support hours to easily update text copy, images, and prices.' }
            ],
            whoTitle: 'Who This Is For',
            whoDesc: 'Our secure hosting and regular maintenance packages are specifically designed for local establishments who want to avoid technical management tasks, including:',
            whoBullets: [
              'Businesses requiring consistent content updates and price changes',
              'E-commerce catalog stores that cannot tolerate downtime',
              'Showrooms and schools needing reliable, monthly email management',
              'Firms lacking in-house technical personnel to handle web servers'
            ],
            whoBtn: 'Choose Hosting Plan',
            processTitle: 'Maintenance Process',
            processSub: 'How we ensure your site is secure, fast, and continuously updated.',
            processSteps: [
              { title: 'Server Setup', desc: 'We configure highly secure, lightning-fast SSD cloud spaces for your domain.' },
              { title: 'SSL Security', desc: 'Integrating security locks to encrypt customer inputs and verify your identity.' },
              { title: 'Backup Automation', desc: 'Deploying scripts to run weekly backups, storing them safely in a remote cloud.' },
              { title: 'Content Care', desc: 'Send us your photos or content updates via WhatsApp or Email, and we apply them within 24 hours.' }
            ],
            faqTitle: 'Hosting & Support FAQ',
            faqSub: 'Frequently asked questions about our hosting stability, backups, and site updates.',
            faqs: [
              { q: 'Do you provide free domain names and security locks (SSL)?', a: 'Yes. All our yearly hosting packages include a free `.com` or `.in` domain registration for the first year, alongside free SSL security certificates to display the secure padlock icon next to your URL.' },
              { q: 'What happens if my website goes offline unexpectedly?', a: 'Our servers run automated tracking systems that alert us immediately in the event of an outage. We troubleshoot the issues instantly, and since we run weekly backups, we can restore your site in minutes if a critical server error occurs.' },
              { q: 'How can I request updates to my text, photos, or prices?', a: "It's very easy. You can send the new text copy or images to us directly via WhatsApp or Email. We apply the requested changes onto your live website within 24 business hours." },
              { q: 'Is my customer data safe on your cloud servers?', a: 'Yes. We implement firewalls, restrict server folder permissions, monitor traffic for malicious bots, and configure database encryptions. This ensures that contact forms or customer databases are securely shielded from data leaks.' }
            ],
            crossTitle: 'You May Also Need These Services',
            crossCards: [
              { title: 'Web Development', desc: 'Stunning, fast-loading corporate websites custom-coded to reflect your brand and convert visitors into buyers.', link: 'Go to Web Development' },
              { title: 'SEO Optimization', desc: 'Climb search rankings on Google for local Tamil Nadu searches and direct targeted customer calls straight to your office.', link: 'Go to SEO Optimization' }
            ],
            ctaTitle: 'Want Reliable, Hassle-Free Cloud Hosting?',
            ctaDesc: 'Let our specialists deploy and maintain your website while you focus on growing your sales.',
            ctaBtn: 'Get Hosting Setup'
          },
          ta: {
            heroH1: 'ஹோஸ்டிங் & பராமரிப்பு சேவைகள்',
            crumb: 'ஹோஸ்டிங் & பராமரிப்பு',
            mainTitle: 'கவலையற்ற கிளவுட் ஹோஸ்டிங் & ஆதரவு',
            mainSub: 'ஒரு இணையதளம் எப்போதும் ஆன்லைனிலும் பாதுகாப்பாகவும் இருந்தால் மட்டுமே பயனுள்ளதாக இருக்கும். நீங்கள் உங்கள் வணிகத்தில் கவனம் செலுத்த, ஹோஸ்டிங், சர்வர் பராமரிப்பு மற்றும் பேக்கப்களை நாங்கள் கையாளுகிறோம்.',
            desc: 'சர்வர்களை அமைப்பது, டொமைன்களை இணைப்பது, SSL பாதுகாப்பு சான்றிதழ்களை உள்ளமைப்பது மற்றும் தரவு காப்புப்பிரதிகளைக் கையாள்வது ஆகியவை சிக்கலானவை. தவறு நடந்தால் தளம் மெதுவாக இயங்கலாம் அல்லது செயலிழக்கலாம். எங்கள் ஹோஸ்டிங் திட்டங்கள் உங்கள் கோப்புகளை அதிவேக கிளவுட் சர்வர்களில் பாதுகாப்பாக வைக்கின்றன.',
            includedTitle: 'இந்த சேவையில் சேர்க்கப்பட்டுள்ளவை',
            features: [
              { title: 'கிளவுட் வெப் ஹோஸ்டிங்', desc: 'வேகமான SSD சர்வர்கள் மூலம் மிகக் குறைந்த லோடிங் நேரம் மற்றும் நிலையான செயல்திறன்.' },
              { title: 'தொடர்ச்சியான பாதுகாப்பு', desc: 'அதிநவீன ஃபயர்வால்கள் மற்றும் தினசரி மால்வேர் கண்காணிப்பு மூலம் அச்சுறுத்தல்களைத் தடுத்தல்.' },
              { title: 'வாராந்திர பேக்கப்கள்', desc: 'வாராந்திர தானியங்கி காப்புப்பிரதிகள் மூலம் உங்கள் இணையதள கோப்புகள் மற்றும் தரவுத்தளங்களைப் பாதுகாத்தல்.' },
              { title: 'வழக்கமான உள்ளடக்க மாற்றங்கள்', desc: 'அனைத்து திட்டங்களிலும் புதிய உரை, புகைப்படங்கள் மற்றும் விலைகளைப் புதுப்பிப்பதற்கான ஆதரவு நேரம்.' }
            ],
            whoTitle: 'இது யாருக்கானது',
            whoDesc: 'எங்கள் பாதுகாப்பான ஹோஸ்டிங் மற்றும் வழக்கமான பராமரிப்பு திட்டங்கள் பின்வரும் வணிக நிறுவனங்களுக்காக சிறப்பாக வடிவமைக்கப்பட்டுள்ளன:',
            whoBullets: [
              'வழக்கமான தகவல் மற்றும் விலை மாற்றங்கள் தேவைப்படும் வணிகங்கள்',
              'எந்தவொரு சூழ்நிலையிலும் செயலிழக்கக் கூடாத மின்-வணிகத் தளங்கள்',
              'நம்பகமான மின்னஞ்சல் மேலாண்மை தேவைப்படும் பள்ளிகள் மற்றும் நிறுவனங்கள்',
              'இணைய சர்வர்களை நிர்வகிக்க தனி தொழில்நுட்ப குழு இல்லாத வணிகங்கள்'
            ],
            whoBtn: 'ஹோஸ்டிங் திட்டத்தைத் தேர்வு செய்ய',
            processTitle: 'பராமரிப்பு செயல்முறை',
            processSub: 'உங்கள் தளம் பாதுகாப்பாகவும், வேகமாகவும் மற்றும் தொடர்ந்து புதுப்பிக்கப்படுவதையும் நாங்கள் எவ்வாறு உறுதி செய்கிறோம்.',
            processSteps: [
              { title: 'சர்வர் கட்டமைப்பு', desc: 'உங்கள் இணையதளத்திற்காக அதிவேக மற்றும் பாதுகாப்பான SSD கிளவுட் சர்வர்களை அமைத்தல்.' },
              { title: 'SSL பாதுகாப்பு', desc: 'வாடிக்கையாளர் தகவல்களை குறியாக்க பாதுகாப்பு பூட்டுகளை (SSL padlock) இணைத்தல்.' },
              { title: 'தானியங்கி பேக்கப்', desc: 'வாராந்திர தானியங்கி காப்புப்பிரதிகளை எடுத்து தொலைதூர கிளவுடில் பாதுகாப்பாகச் சேமித்தல்.' },
              { title: 'தகவல் புதுப்பிப்பு', desc: 'புதிய புகைப்படங்கள் அல்லது விவரங்களை வாட்ஸ்அப்/மின்னஞ்சலில் அனுப்பினால் 24 மணி நேரத்திற்குள் மாற்றுதல்.' }
            ],
            faqTitle: 'ஹோஸ்டிங் & ஆதரவு - அடிக்கடி கேட்கப்படும் கேள்விகள்',
            faqSub: 'எங்கள் ஹோஸ்டிங் நிலைத்தன்மை, பேக்கப்கள் மற்றும் தள மேம்பாடுகள் பற்றிய பொதுவான கேள்விகள்.',
            faqs: [
              { q: 'டொமைன் பெயர் மற்றும் பாதுகாப்பு பூட்டு (SSL) இலவசமாக வழங்கப்படுமா?', a: 'ஆம். எங்களது வருடாந்திர ஹோஸ்டிங் திட்டங்களில் முதல் வருடத்திற்கு இலவச `.com` அல்லது `.in` டொமைன் மற்றும் இலவச SSL சான்றிதழ் வழங்கப்படுகிறது.' },
              { q: 'எனது இணையதளம் திடீரென செயலிழந்தால் என்ன நடக்கும்?', a: 'எங்கள் சர்வர்கள் தானியங்கி கண்காணிப்பு மூலம் இயங்குகின்றன. ஏதேனும் சிக்கல் ஏற்பட்டால் உடனே எங்களுக்குத் தெரியவரும். மேலும் வாராந்திர பேக்கப் உள்ளதால் சில நிமிடங்களில் தளத்தை மீட்டெடுக்க முடியும்.' },
              { q: 'விலை அல்லது புகைப்படங்களை எவ்வாறு புதுப்பிப்பது?', a: 'மிகவும் எளிது. புதிய விவரங்களை வாட்ஸ்அப் அல்லது மின்னஞ்சல் மூலம் எங்களுக்கு அனுப்பினால், 24 வேலை நேரத்திற்குள் தளத்தில் மாற்றித் தருவோம்.' },
              { q: 'எங்கள் வாடிக்கையாளர் தரவு சர்வர்களில் பாதுகாப்பாக இருக்குமா?', a: 'ஆம். ஃபயர்வால்கள், சர்வர் பாதுகாப்பு கட்டுப்பாடுகள் மற்றும் தரவுத்தள குறியாக்கங்களை செயல்படுத்துகிறோம். இதனால் படிவ விவரங்கள் மற்றும் தரவுகள் கசிவதிலிருந்து பாதுகாக்கப்படுகிறது.' }
            ],
            crossTitle: 'உங்களுக்கு இந்த சேவைகளும் தேவைப்படலாம்',
            crossCards: [
              { title: 'இணையதள வடிவமைப்பு', desc: 'உங்கள் பிராண்டை மேம்படுத்தவும் வாடிக்கையாளர்களை ஈர்க்கவும் புதிதாக எழுதப்பட்ட அதிவேக இணையதளங்கள்.', link: 'இணையதள வடிவமைப்பு பகுதிக்குச் செல்ல' },
              { title: 'தேடுபொறி உகப்பாக்கம் (SEO)', desc: 'கூகுள் தேடலில் உங்கள் வணிகத்தை முதலிடத்திற்கு கொண்டு வரவும் மற்றும் நேரடி வாடிக்கையாளர் அழைப்புகளைப் பெறவும்.', link: 'SEO பகுதிக்குச் செல்ல' }
            ],
            ctaTitle: 'கவலையற்ற கிளவுட் ஹோஸ்டிங் வேண்டுமா?',
            ctaDesc: 'உங்கள் இணையதளத்தை எங்கள் வல்லுநர்கள் நிர்வகிக்கட்டும், நீங்கள் வணிக வளர்ச்சியில் கவனம் செலுத்துங்கள்.',
            ctaBtn: 'ஹோஸ்டிங் பெற'
          }
        },
        'seo-optimization.html': {
          en: {
            heroH1: 'SEO Optimization Services',
            crumb: 'SEO Optimization',
            mainTitle: 'Climb Search Engine Rankings & Attract Buying Customers',
            mainSub: 'A website is only an asset if potential customers can find it on Google. We optimize your code, text copy, and map presence to rank you first for buyer searches in your target cities.',
            desc: 'Whenever people look for local services (e.g. "private clinic in Salem" or "textile distributor in Madurai"), Google displays map results and highly relevant websites first. If your business isn\'t listed, you lose daily customer leads. Our local SEO packages optimize your rankings in local city searches.',
            includedTitle: "What's Included in this Service",
            features: [
              { title: 'Local Map SEO', desc: 'Verify and rank your Google Business Profile in target maps.' },
              { title: 'Keyword Research', desc: 'Analyze buying keywords Tamil Nadu customers enter on search portals.' },
              { title: 'On-Page Copy Editing', desc: 'Structuring headings, text copy, image tags, and schema markers.' },
              { title: 'Structured Reporting', desc: 'Receive monthly charts of ranking jumps, clicks, and calls generated.' }
            ],
            whoTitle: 'Who This Is For',
            whoDesc: 'Our localized SEO optimization strategies are tailored for regional service businesses looking to capture local customer phone calls, including:',
            whoBullets: [
              'Local service providers (wedding halls, clinics, transport firms)',
              'Distributors, wholesalers, and factories seeking dealer enquiries',
              'Professional consultation consultants (Chartered Accountants, Lawyers)',
              'Retail stores and showrooms aiming to attract in-store footfall'
            ],
            whoBtn: 'Request Local SEO Audit',
            processTitle: 'Our SEO Process',
            processSub: 'How we identify, rank, and track local search queries for your business.',
            processSteps: [
              { title: 'Keyword Search', desc: 'We discover what search queries local buyers enter to locate your services.' },
              { title: 'Map Alignment', desc: 'Optimizing your Google Business Profile with keywords, hours, and photos.' },
              { title: 'Code & Copy Fix', desc: 'Inserting metadata, headers, image alt text, and Tamil Nadu Local Schema markers.' },
              { title: 'Track & Refine', desc: 'Analyzing monthly console search clicks, ranking changes, and direct phone calls.' }
            ],
            faqTitle: 'SEO Optimization FAQ',
            faqSub: 'Common questions about Google Map listings, ranking timelines, and outputs.',
            faqs: [
              { q: 'What is Local SEO, and how does it help Tamil Nadu businesses?', a: 'Local SEO focuses on ranking your business in searches from your specific geographical area (e.g. "best clinic in Coimbatore" or "wood wholesale in Madurai"). By targeting localized search terms, we connect your business directly with high-intent buyers in your city.' },
              { q: 'How long does it take to see rankings and calls increase?', a: 'Local SEO is a gradual process. Less competitive local terms can show ranking gains within 30 to 45 days, while highly competitive industries take 3 to 6 months of steady optimization to reach top positions on search results.' },
              { q: 'Do you guarantee the #1 spot on Google?', a: "No reputable agency can guarantee a #1 spot on search engine results, since Google regularly updates its algorithms. We do guarantee complete adherence to Google's Search Essentials (Webmaster Guidelines), which secures steady traffic growth and shields your site from penalties." },
              { q: 'What metrics do you provide in your monthly reports?', a: 'We share simplified, transparent performance reports tracking: your primary keyword rankings, search impressions, organic search click-throughs, and action clicks on your Google Map profile (such as phone calls and direction requests).' }
            ],
            crossTitle: 'You May Also Need These Services',
            crossCards: [
              { title: 'Web Development', desc: 'Stunning, fast-loading corporate websites custom-coded to reflect your brand and convert visitors into buyers.', link: 'Go to Web Development' },
              { title: 'Ad Marketing', desc: 'High-converting local Google Ads and Meta campaigns optimized to generate inquiries within your marketing budget.', link: 'Go to Ad Marketing' }
            ],
            ctaTitle: 'Ready to Maximize Your Google Visibility?',
            ctaDesc: 'Get in touch for a detailed review of your search rankings and a plan to scale your local traffic.',
            ctaBtn: 'Start Local SEO'
          },
          ta: {
            heroH1: 'தேடுபொறி உகப்பாக்கம் (SEO)',
            crumb: 'தேடுபொறி உகப்பாக்கம்',
            mainTitle: 'கூகுள் தேடலில் முதலிடம் பெற்று வாடிக்கையாளர்களை ஈர்க்கவும்',
            mainSub: 'வாடிக்கையாளர்கள் கூகுளில் தேடும்போது உங்கள் இணையதளம் அவர்களுக்குத் தெரிந்தால் மட்டுமே அது வெற்றிகரமானதாக இருக்கும். உங்கள் தளம் மற்றும் வரைபடத்தை நாங்கள் மேம்படுத்துகிறோம்.',
            desc: 'மக்கள் தங்களுக்குத் தேவையான உள்ளூர் சேவைகளைத் தேடும்போது (எ.கா. "சேலத்தில் உள்ள தனியார் மருத்துவமனை"), கூகுள் வரைபட முடிவுகளையும் தொடர்புடைய தளங்களையும் முதலில் காட்டும். உங்களது வணிகம் அதில் இல்லையென்றால் வாடிக்கையாளர்களை இழப்பீர்கள். எங்கள் SEO திட்டங்கள் உங்களை முன்னிலைப்படுத்தும்.',
            includedTitle: 'இந்த சேவையில் சேர்க்கப்பட்டுள்ளவை',
            features: [
              { title: 'உள்ளூர் வரைபட SEO', desc: 'கூகுள் வரைபடத்தில் உங்கள் வணிக சுயவிவரத்தை சரிபார்த்து முன்னிலைப்படுத்துதல்.' },
              { title: 'முக்கிய வார்த்தை ஆராய்ச்சி', desc: 'தமிழ்நாடு வாடிக்கையாளர்கள் பயன்படுத்தும் தேடல் வார்த்தைகளை பகுப்பாய்வு செய்தல்.' },
              { title: 'இணையப் பக்க மேம்பாடு', desc: 'மெட்டாடேட்டா, தலைப்புகள், படங்களின் குறிச்சொற்கள் போன்றவற்றை உள்ளமைத்தல்.' },
              { title: 'முறையான அறிக்கையிடல்', desc: 'மாதாந்திர தேடல் கிளிக்குகள், அழைப்புகள் மற்றும் தரவரிசை மாற்றங்களின் வரைபட அறிக்கை.' }
            ],
            whoTitle: 'இது யாருக்கானது',
            whoDesc: 'உள்ளூர் வாடிக்கையாளர்களின் அழைப்புகள் மற்றும் விசாரணைகளைப் பெற விரும்பும் வணிகங்களுக்காக எங்கள் SEO உத்திகள் வடிவமைக்கப்பட்டுள்ளன:',
            whoBullets: [
              'உள்ளூர் சேவை வழங்குநர்கள் (திருமண மண்டபங்கள், கிளினிக்குகள், லாரி சர்வீஸ்)',
              'புதிய டீலர்களைத் தேடும் விநியோகஸ்தர்கள், மொத்த விற்பனையாளர்கள் மற்றும் தொழிற்சாலைகள்',
              'தொழில்முறை ஆலோசகர்கள் (ஆடிட்டர்கள், வழக்கறிஞர்கள்)',
              'கடைகள் மற்றும் வாடிக்கையாளர்களை நேரடியாக ஈர்க்க விரும்பும் சில்லறை விற்பனை நிலையங்கள்'
            ],
            whoBtn: 'இலவச SEO தணிக்கை பெற',
            processTitle: 'எங்கள் SEO செயல்முறை',
            processSub: 'உள்ளூர் தேடல் முடிவுகளில் உங்கள் வணிகத்தை எவ்வாறு அடையாளம் கண்டு, தரவரிசைப்படுத்தி, கண்காணிக்கிறோம்.',
            processSteps: [
              { title: 'தேடல் வார்த்தைகள்', desc: 'உள்ளூர் வாடிக்கையாளர்கள் உங்கள் சேவைகளைக் கண்டறிய பயன்படுத்தும் வார்த்தைகளைக் கண்டறிதல்.' },
              { title: 'வரைபட உகப்பாக்கம்', desc: 'கூகுள் பிசினஸ் புரொஃபைலை முக்கிய வார்த்தைகள் மற்றும் புகைப்படங்களுடன் மேம்படுத்துதல்.' },
              { title: 'குறியீடு & பக்க திருத்தம்', desc: 'மெட்டாடேட்டா, தலைப்புகள் மற்றும் உள்ளூர் திட்டக்குறிகளை (schema markers) இணைத்தல்.' },
              { title: 'கண்காணிப்பு', desc: 'மாதாந்திர தேடல் கிளிக்குகள், தரவரிசை மாற்றங்கள் மற்றும் தொலைபேசி அழைப்புகளைக் கண்காணித்தல்.' }
            ],
            faqTitle: 'SEO - அடிக்கடி கேட்கப்படும் கேள்விகள்',
            faqSub: 'கூகுள் மேப் பட்டியல்கள், தரவரிசை காலக்கெடு மற்றும் முடிவுகள் பற்றிய பொதுவான கேள்விகள்.',
            faqs: [
              { q: 'உள்ளூர் SEO (Local SEO) என்றால் என்ன, அது எவ்வாறு உதவுகிறது?', a: 'உள்ளூர் SEO என்பது உங்கள் பகுதியில் உள்ள மக்கள் தேடும்போது உங்களை முன்னிலைப்படுத்துவதாகும் (எ.கா. "கோயம்புத்தூரில் சிறந்த பல் மருத்துவமனை"). இதன் மூலம் உங்கள் நகரத்தில் உள்ள வாடிக்கையாளர்களை நேரடியாகச் சென்றடையலாம்.' },
              { q: 'தரவரிசை மற்றும் அழைப்புகள் அதிகரிக்க எவ்வளவு காலம் ஆகும்?', a: 'இது ஒரு படிப்படியான செயல்முறையாகும். போட்டி குறைவாக உள்ள வார்த்தைகளுக்கு 30 முதல் 45 நாட்களில் மாற்றங்கள் தெரியும். அதிக போட்டி உள்ள வணிகங்களுக்கு 3 முதல் 6 மாதங்கள் வரை ஆகலாம்.' },
              { q: 'கூகுளில் முதல் இடத்திற்கு நீங்கள் உத்தரவாதம் தருகிறீர்களா?', a: 'கூகுள் அதன் வழிமுறைகளை தொடர்ந்து மாற்றுவதால் எந்தவொரு நிறுவனமும் முதல் இடத்திற்கு உத்தரவாதம் அளிக்க முடியாது. ஆனால் கூகுளின் அதிகாரப்பூர்வ வழிகாட்டுதல்களைப் பின்பற்றி சிறந்த முடிவுகளைத் தருவோம்.' },
              { q: 'மாதாந்திர அறிக்கைகளில் நீங்கள் என்ன விவரங்களை வழங்குகிறீர்கள்?', a: 'முக்கிய வார்த்தைகளின் தரவரிசை, இணையதள பார்வை எண்ணிக்கை, மற்றும் கூகுள் மேப் மூலம் உங்களுக்கு வந்த அழைப்புகள் மற்றும் திசைத் தேடல்கள் போன்றவற்றை எளிமையான வரைபடமாக வழங்குவோம்.' }
            ],
            crossTitle: 'உங்களுக்கு இந்த சேவைகளும் தேவைப்படலாம்',
            crossCards: [
              { title: 'இணையதள வடிவமைப்பு', desc: 'உங்கள் பிராண்டை மேம்படுத்தவும் வாடிக்கையாளர்களை ஈர்க்கவும் புதிதாக எழுதப்பட்ட அதிவேக இணையதளங்கள்.', link: 'இணையதள வடிவமைப்பு பகுதிக்குச் செல்ல' },
              { title: 'விளம்பர மார்க்கெட்டிங்', desc: 'குறைந்த செலவில் வாடிக்கையாளர் விசாரணைகளை உடனடியாகப் பெற உதவும் கூகுள் மற்றும் மெட்டா விளம்பரங்கள்.', link: 'விளம்பர மார்க்கெட்டிங் பகுதிக்குச் செல்ல' }
            ],
            ctaTitle: 'கூகுளில் உங்கள் தெரிவுநிலையை அதிகரிக்கத் தயாரா?',
            ctaDesc: 'உங்கள் தற்போதைய தரவரிசையை ஆய்வு செய்து உள்ளூர் போக்குவரத்தை மேம்படுத்த எங்களைத் தொடர்பு கொள்ளுங்கள்.',
            ctaBtn: 'உள்ளூர் SEO தொடங்க'
          }
        },
        'fullstack-applications.html': {
          en: {
            heroH1: 'Full Stack Applications',
            crumb: 'Full Stack Applications',
            mainTitle: 'Custom Software Engineering for Growing Workflows',
            mainSub: 'When a standard website is not enough, we build bespoke fullstack web applications that automate your operational steps, store business data securely, and scale with your user base.',
            desc: 'Whether you need an internal portal to track dealer inventory, a booking panel for custom appointments, or a secure admin dashboard to control products and orders, our developers build robust backend databases and highly functional user interfaces to fit your exact specifications.',
            includedTitle: "What's Included in this Service",
            features: [
              { title: 'Admin Dashboards', desc: 'Easy-to-use control panels to track dynamic data, users, and orders.' },
              { title: 'Secure Databases', desc: 'Custom schema layout on relational databases like MySQL or PostgreSQL.' },
              { title: 'Third-Party API Hook', desc: 'Integrate SMS triggers, WhatsApp templates, and local payment getaways.' },
              { title: 'Encryption Security', desc: 'Modern encryption methods to shield user credentials and customer files.' }
            ],
            whoTitle: 'Who This Is For',
            whoDesc: 'Our custom fullstack application packages are designed to automate operations and replace spreadsheets for businesses like:',
            whoBullets: [
              'Distributors requiring custom B2B bulk ordering systems',
              'Booking operations (travel desks, event halls, service booking)',
              'Private coaching classes, schools, and clinics managing databases',
              'Growing startups building custom client-facing applications'
            ],
            whoBtn: 'Scope Your Application',
            processTitle: 'Our Development Process',
            processSub: 'A structured engineering process ensuring clean logic and reliable delivery.',
            processSteps: [
              { title: 'Architecture Plan', desc: 'We map out the database tables, user roles, and core security guidelines.' },
              { title: 'Backend Coding', desc: 'Setting up servers, code logic, user logins, and database queries.' },
              { title: 'Frontend Building', desc: 'Custom styling the admin dashboards and forms for smooth mobile navigation.' },
              { title: 'Penetration Test', desc: 'Auditing input validations, SQL injection checks, and deploying to cloud storage.' }
            ],
            faqTitle: 'Full Stack Applications FAQ',
            faqSub: 'Frequently asked questions about customization, costs, and timeline scopes.',
            faqs: [
              { q: 'What makes a fullstack web app different from a website?', a: 'A standard website is informational (brochure pages). A fullstack web application is dynamic and database-driven: it allows users to log in, create profiles, book dates, process payments, and search databases, while giving admins a secure panel to control everything.' },
              { q: 'How secure is the database and customer records?', a: 'We implement industry-standard database guidelines: password salting and hashing, prevention of SQL injections, input verification, cross-site scripting (XSS) blocks, and HTTPS encryption.' },
              { q: 'Can we integrate payment gateways and local SMS APIs?', a: 'Yes. We integrate leading UPI gateways (Razorpay, Instamojo) so customers can pay directly via GPay, PhonePe, or Cards. We also link SMS gateways (like Twilio or local providers) for automatic order updates or OTP verifications.' },
              { q: 'What is the typical timeframe for application engineering?', a: 'Simple databases and booking scripts take approximately 4 to 5 weeks. More complex ERP panels or SaaS applications with extensive role structures and API linkages require 6 to 10 weeks.' }
            ],
            crossTitle: 'You May Also Need These Services',
            crossCards: [
              { title: 'Web Development', desc: 'Stunning, fast-loading corporate websites custom-coded to reflect your brand and convert visitors into buyers.', link: 'Go to Web Development' },
              { title: 'Hosting & Maintenance', desc: 'Keep your custom site secure, patched, backed up weekly, and running on premium speed-optimized local cloud servers.', link: 'Go to Hosting & Maintenance' }
            ],
            ctaTitle: 'Need a Custom Web Application for Your Business?',
            ctaDesc: 'Book a consultation to review your logic steps and receive a customized technical proposal.',
            ctaBtn: 'Schedule Scoping Meeting'
          },
          ta: {
            heroH1: 'முழுமையான மென்பொருள் செயலி',
            crumb: 'முழுமையான செயலிகள்',
            mainTitle: 'வளரும் வணிகங்களுக்கான தனிப்பயன் மென்பொருள் வடிவமைப்பு',
            mainSub: 'ஒரு சாதாரண இணையதளம் மட்டும் போதாத போது, செயல்பாடுகளை தானியக்கமாக்கவும், தரவுகளை பாதுகாப்பாக சேமிக்கவும் உதவும் தனிப்பயன் வலைச் செயலிகளை நாங்கள் உருவாக்குகிறோம்.',
            desc: 'விற்பனையாளர் பங்குகளைக் கண்காணிப்பதற்கான உள் போர்டல், அப்பாயிண்ட்மெண்ட் முன்பதிவு பேனல் அல்லது ஆர்டர்களைக் கட்டுப்படுத்த பாதுகாப்பான நிர்வாக டாஷ்போர்டு போன்றவற்றை உங்கள் தேவைக்கேற்ப சிறந்த கட்டமைப்புகளுடன் உருவாக்குகிறோம்.',
            includedTitle: 'இந்த சேவையில் சேர்க்கப்பட்டுள்ளவை',
            features: [
              { title: 'நிர்வாக டாஷ்போர்டுகள்', desc: 'தரவுகள், பயனர்கள் மற்றும் ஆர்டர்களை எளிதாகக் கண்காணிக்க உதவும் கட்டுப்பாட்டுப் பலகங்கள்.' },
              { title: 'பாதுகாப்பான தரவுத்தளங்கள்', desc: 'MySQL அல்லது PostgreSQL போன்ற தளங்களில் தனிப்பயனாக்கப்பட்ட தரவு சேமிப்பு வடிவமைப்பு.' },
              { title: 'வெளிப்புற API இணைப்புகள்', desc: 'தானியங்கி SMS, வாட்ஸ்அப் செய்திகள் மற்றும் உள்ளூர் கட்டண நுழைவாயில்களை இணைத்தல்.' },
              { title: 'குறியாக்க பாதுகாப்பு', desc: 'வாடிக்கையாளர் கடவுச்சொற்கள் மற்றும் கோப்புகளைப் பாதுகாக்க நவீன குறியாக்க முறைகள்.' }
            ],
            whoTitle: 'இது யாருக்கானது',
            whoDesc: 'எங்கள் முழுமையான வலைச் செயலி திட்டங்கள் ஸ்ப்ரெட்ஷீட்களைத் தவிர்த்து செயல்பாடுகளை தானியக்கமாக்க விரும்பும் வணிகங்களுக்காக வடிவமைக்கப்பட்டுள்ளன:',
            whoBullets: [
              'மொத்த விநியோகஸ்தர்களுக்கான B2B ஆர்டர் மேலாண்மை அமைப்புகள்',
              'முன்பதிவு செயல்பாடுகள் (பயணச் சீட்டு, திருமண மண்டபம், சேவை முன்பதிவு)',
              'தரவுத்தளங்களை நிர்வகிக்கும் தனியார் பயிற்சி வகுப்புகள், பள்ளிகள் மற்றும் கிளினிக்குகள்',
              'தங்கள் சேவைகளுக்காக பிரத்யேக செயலி உருவாக்க விரும்பும் வளரும் ஸ்டார்ட்அப்கள்'
            ],
            whoBtn: 'செயலி திட்டத்தைத் திட்டமிட',
            processTitle: 'எங்கள் வடிவமைப்பு செயல்முறை',
            processSub: 'முறையான திட்டமிடல் மற்றும் நம்பகமான டெலிவரியை உறுதி செய்யும் கட்டமைக்கப்பட்ட மென்பொருள் வடிவமைப்பு.',
            processSteps: [
              { title: 'கட்டமைப்பு திட்டம்', desc: 'தரவுத்தள அட்டவணைகள், பயனர் பாத்திரங்கள் மற்றும் பாதுகாப்பு வழிகாட்டுதல்களைத் திட்டமிடுதல்.' },
              { title: 'பின்னணி குறியீட்டு முறை', desc: 'சர்வர்கள், வணிக விதிகள், பயனர் உள்நுழைவுகள் மற்றும் தரவுத்தளக் குறியீடுகளை அமைத்தல்.' },
              { title: 'முன்னணி வடிவமைப்பு', desc: 'மொபைல் பயன்பாட்டிற்கு உகந்த நிர்வாக டாஷ்போர்டுகள் மற்றும் படிவங்களை வடிவமைத்தல்.' },
              { title: 'பாதுகாப்பு தணிக்கை', desc: 'குறியீட்டு பிழைகள், ஊடுருவல் அபாயங்கள் போன்றவற்றைச் சோதித்து கிளவுடில் பதிவேற்றுதல்.' }
            ],
            faqTitle: 'மென்பொருள் செயலி - அடிக்கடி கேட்கப்படும் கேள்விகள்',
            faqSub: 'தனிப்பயனாக்கம், செலவுகள் மற்றும் கால அவகாசம் பற்றிய பொதுவான கேள்விகள்.',
            faqs: [
              { q: 'வலைச் செயலி (Web App) சாதாரண இணையதளத்திலிருந்து எவ்வாறு வேறுபடுகிறது?', a: 'ஒரு சாதாரண இணையதளம் தகவல்களை மட்டுமே வழங்கும். ஆனால் வலைச் செயலி என்பது பயனர்கள் உள்நுழையவும், முன்பதிவு செய்யவும், பணம் செலுத்தவும் மற்றும் தரவுகளைத் தேடவும் அனுமதிக்கும் ஒரு ஊடாடும் அமைப்பாகும்.' },
              { q: 'தரவுத்தளம் மற்றும் வாடிக்கையாளர் பதிவுகள் எவ்வளவு பாதுகாப்பானது?', a: 'கடவுச்சொல் குறியாக்கம் (Hashing), SQL உட்செலுத்துதல் தடுப்பு, உள்ளீட்டு சரிபார்ப்பு மற்றும் HTTPS குறியாக்கம் போன்ற தொழில்துறை தர பாதுகாப்பு நெறிமுறைகளைப் பயன்படுத்துகிறோம்.' },
              { q: 'கட்டண நுழைவாயில்கள் மற்றும் SMS வசதிகளை இணைக்க முடியுமா?', a: 'ஆம். Razorpay, Instamojo போன்ற UPI நுழைவாயில்கள் மற்றும் OTP சரிபார்ப்புகளுக்கான தானியங்கி SMS வசதிகளை எளிதாக இணைக்க முடியும்.' },
              { q: 'செயலியை உருவாக்க வழக்கமாக எவ்வளவு காலம் ஆகும்?', a: 'சாதாரண முன்பதிவு செயலிகள் மற்றும் தரவுத்தளங்கள் அமைக்க 4 முதல் 5 வாரங்கள் ஆகும். சிக்கலான ERP அல்லது SaaS செயலிகளை உருவாக்க 6 முதல் 10 வாரங்கள் வரை ஆகலாம்.' }
            ],
            crossTitle: 'உங்களுக்கு இந்த சேவைகளும் தேவைப்படலாம்',
            crossCards: [
              { title: 'இணையதள வடிவமைப்பு', desc: 'உங்கள் பிராண்டை மேம்படுத்தவும் வாடிக்கையாளர்களை ஈர்க்கவும் புதிதாக எழுதப்பட்ட அதிவேக இணையதளங்கள்.', link: 'இணையதள வடிவமைப்பு பகுதிக்குச் செல்ல' },
              { title: 'ஹோஸ்டிங் & பராமரிப்பு', desc: 'உங்கள் தளத்தை பாதுகாப்பாக வைத்திருக்கவும், வாராந்திர பேக்கப் எடுக்கவும் மற்றும் அதிவேக கிளவுட் சர்வர்களில் இயக்கவும்.', link: 'ஹோஸ்டிங் & பராமரிப்பு பகுதிக்குச் செல்ல' }
            ],
            ctaTitle: 'உங்கள் வணிகத்திற்கு தனிப்பயன் வலைச் செயலி தேவையா?',
            ctaDesc: 'உங்கள் தேவைகளைப் பகிர்ந்து கொண்டு விரிவான தொழில்நுட்ப திட்டத்தைப் பெற எங்களை அணுகவும்.',
            ctaBtn: 'ஆலோசனை கூட்டம் திட்டமிட'
          }
        },
        'social-media-management.html': {
          en: {
            heroH1: 'Social Media Management',
            crumb: 'Social Media Management',
            mainTitle: 'Engage Your Local Audience & Build Brand Value',
            mainSub: 'A vibrant social media presence builds trust with local buyers. We design professional posters, draft engaging captions, and maintain a consistent monthly posting calendar for your brand.',
            desc: 'Small business owners rarely have the time to design layouts, write text copy, and post consistently on Instagram and Facebook. If your profile pages look empty or outdated, potential customers might choose a competitor instead. We manage your profiles professionally within a budget that works for you.',
            includedTitle: "What's Included in this Service",
            features: [
              { title: 'Custom Poster Designs', desc: 'Professional graphic layouts matching your corporate colors and logo style.' },
              { title: 'Calendar Scheduling', desc: 'Consistent, weekly publication schedules to keep your profiles active.' },
              { title: 'Bilingual Copywriting', desc: 'We write catchy text in both English and Tamil to connect with local buyers.' },
              { title: 'DM Response Care', desc: 'Forwarding lead messages and comments directly to your WhatsApp.' }
            ],
            whoTitle: 'Who This Is For',
            whoDesc: 'Our social media management packages are built to keep profiles highly active and engaging for businesses like:',
            whoBullets: [
              'Retail showrooms (textile, jewelry, electronics) presenting products',
              'Restaurants, cafes, sweet shops, and bakeries building local brand recognition',
              'Wedding halls, decorators, planners, and photographers showcasing projects',
              'Gyms, fitness centers, clinical labs, and private schools'
            ],
            whoBtn: 'Request Posting Calendar',
            processTitle: 'Social Management Process',
            processSub: 'A clear, monthly timeline ensuring quality posts and prompt scheduling reviews.',
            processSteps: [
              { title: 'Creative Theme Plan', desc: 'We establish color grids, font combinations, and content themes for the month.' },
              { title: 'Graphic Design', desc: 'Designing custom, high-end post graphics featuring your offers or tips.' },
              { title: 'Tamil/English Copy', desc: 'Drafting descriptions with hashtags to boost search rankings and local engagement.' },
              { title: 'Scheduling', desc: 'We review and approve drafts, scheduling them to publish automatically on peak hours.' }
            ],
            faqTitle: 'Social Media FAQ',
            faqSub: 'Common questions about platform setups, poster topics, and monthly contract durations.',
            faqs: [
              { q: 'Which social media portals do you manage for businesses?', a: 'We primarily focus on Instagram and Facebook, as these are the most active platforms for consumers in Tamil Nadu. For B2B companies, we can also optimize and publish professional updates on LinkedIn.' },
              { q: 'Will you write the captions and graphic text in Tamil?', a: 'Yes. To connect effectively with local audiences, we write engaging titles and copy in both Tamil and English (Tanglish or pure Tamil scripting, based on your preference).' },
              { q: 'Do you reply to customer comments and direct messages?', a: 'Yes. We monitor comments and direct inquiries, replying with standard business details (like maps, numbers, and catalog links) and forwarding potential sales inquiries directly to your team on WhatsApp.' },
              { q: 'How many posts do you design and publish each week?', a: 'It depends on the package you choose. Our Starter package includes 2 posts per week (8/month), and our Growth package includes 3 posts per week (12/month), covering festival templates and product spotlights.' }
            ],
            crossTitle: 'You May Also Need These Services',
            crossCards: [
              { title: 'Ad Marketing', desc: 'High-converting local Google Ads and Meta campaigns optimized to generate inquiries within your marketing budget.', link: 'Go to Ad Marketing' },
              { title: 'Web Development', desc: 'Stunning, fast-loading corporate websites custom-coded to reflect your brand and convert visitors into buyers.', link: 'Go to Web Development' }
            ],
            ctaTitle: 'Want a Consistent, Professional Social Presence?',
            ctaDesc: 'Contact our experts to receive a customized content plan and poster designs for your brand.',
            ctaBtn: 'Start Social Media Plan'
          },
          ta: {
            heroH1: 'சமூக ஊடக மேலாண்மை',
            crumb: 'சமூக ஊடக மேலாண்மை',
            mainTitle: 'வாடிக்கையாளர்களை ஈர்த்து உங்கள் பிராண்ட் மதிப்பை உயர்த்துங்கள்',
            mainSub: 'சுறுசுறுப்பான சமூக ஊடகப் பக்கம் வாடிக்கையாளர்களிடையே நம்பிக்கையை உருவாக்குகிறது. உங்கள் பிராண்டிற்காக தொழில்முறை போஸ்டர்கள் மற்றும் ஈர்க்கும் தலைப்புகளை நாங்கள் உருவாக்குகிறோம்.',
            desc: 'சமூக வலைத்தளங்களில் தொடர்ந்து போஸ்டர் வடிவமைத்து பதிவிட நேரம் இல்லாத வணிகங்களுக்கு இது உகந்தது. பக்கங்கள் காலியாக இருப்பதைத் தடுத்து, குறைந்த கட்டணத்தில் பக்கங்களை நாங்கள் நிர்வகிக்கிறோம்.',
            includedTitle: 'இந்த சேவையில் சேர்க்கப்பட்டுள்ளவை',
            features: [
              { title: 'போஸ்டர் வடிவமைப்பு', desc: 'உங்கள் நிறுவனத்தின் வண்ணங்கள் மற்றும் லோகோவுடன் கூடிய தொழில்முறை கிராஃபிக்வடிவமைப்புகள்.' },
              { title: 'திட்டமிடப்பட்ட வெளியீடு', desc: 'உங்கள் பக்கங்களை எப்போதும் சுறுசுறுப்பாக வைக்க வாராந்திர வழக்கமான பதிவுகள்.' },
              { title: 'இருமொழி தலைப்புகள்', desc: 'வாடிக்கையாளர்களை ஈர்க்கும் வகையில் தமிழ் மற்றும் ஆங்கிலத்தில் எழுதப்படும் தலைப்புகள்.' },
              { title: 'விசாரணை மேலாண்மை', desc: 'பக்கங்களில் வரும் விசாரணைகள் மற்றும் கருத்துகளை நேரடியாக உங்கள் வாட்ஸ்அப்பிற்கு அனுப்புதல்.' }
            ],
            whoTitle: 'இது யாருக்கானது',
            whoDesc: 'எங்கள் சமூக ஊடக மேலாண்மைத் திட்டங்கள் தங்கள் ஆன்லைன் இருப்பை சுறுசுறுப்பாக வைத்திருக்க விரும்பும் வணிகங்களுக்காக உருவாக்கப்பட்டுள்ளன:',
            whoBullets: [
              'தயாரிப்புகளைக் காட்சிப்படுத்த விரும்பும் சில்லறை விற்பனை நிலையங்கள் (ஜவுளி, நகைகள், எலக்ட்ரானிக்ஸ்)',
              'உள்ளூர் மக்களிடம் பிராண்ட் மதிப்பை உருவாக்க விரும்பும் உணவகங்கள் மற்றும் இனிப்புக் கடைகள்',
              'தங்கள் பணிகளைப் பகிர விரும்பும் திருமண மண்டபங்கள், புகைப்படக் கலைஞர்கள் மற்றும் அலங்கார நிறுவனங்கள்',
              'விளையாட்டுக்கூடங்கள், உடற்பயிற்சி மையங்கள், ஆய்வகங்கள் மற்றும் தனியார் பள்ளிகள்'
            ],
            whoBtn: 'பதிவு அட்டவணை பெற',
            processTitle: 'சமூக ஊடக மேலாண்மை செயல்முறை',
            processSub: 'தரமான பதிவுகள் மற்றும் சரியான நேர அட்டவணையை உறுதி செய்யும் மாதாந்திர திட்டமிடல் செயல்முறை.',
            processSteps: [
              { title: 'கருப்பொருள் திட்டம்', desc: 'மாதத்திற்கான வண்ணங்கள், எழுத்துருக்கள் மற்றும் உள்ளடக்கக் கருப்பொருளைத் திட்டமிடுதல்.' },
              { title: 'கிராஃபிக் வடிவமைப்பு', desc: 'விளம்பரங்கள் அல்லது தகவல்கள் அடங்கிய உயர் தரமான போஸ்டர்களை வடிவமைத்தல்.' },
              { title: 'தமிழ்/ஆங்கில தலைப்புகள்', desc: 'உள்ளூர் ஈர்ப்பை அதிகரிக்க ஹேஷ்டேக்குகளுடன் கூடிய ஈர்க்கும் தலைப்புகளை எழுதுதல்.' },
              { title: 'முறையான வெளியீடு', desc: 'வடிவமைப்புகளை சரிபார்த்து, வாடிக்கையாளர்கள் அதிகம் பார்க்கும் நேரத்தில் தானாகவே பதிவிடுதல்.' }
            ],
            faqTitle: 'சமூக ஊடகங்கள் - அடிக்கடி கேட்கப்படும் கேள்விகள்',
            faqSub: 'தள அமைப்புகள், போஸ்டர் தலைப்புகள் மற்றும் மாதாந்திர ஒப்பந்தங்கள் பற்றிய பொதுவான கேள்விகள்.',
            faqs: [
              { q: 'வணிகங்களுக்காக எந்தெந்த சமூக ஊடக பக்கங்களை நிர்வகிக்கிறீர்கள்?', a: 'தமிழ்நாட்டில் அதிகம் பயன்படுத்தப்படும் இன்ஸ்டாகிராம் மற்றும் ஃபேஸ்புக் பக்கங்களை முதன்மையாக நிர்வகிக்கிறோம். தேவைப்பட்டால் லிங்க்ட்இன் பக்கத்தையும் நிர்வகிக்க முடியும்.' },
              { q: 'தலைப்புகள் மற்றும் போஸ்டர் உரைகளை தமிழில் எழுதுவீர்களா?', a: 'ஆம். உள்ளூர் வாடிக்கையாளர்களை எளிதாக சென்றடைய தமிழ் மற்றும் ஆங்கிலம் ஆகிய இரு மொழிகளிலும் (அவர்களின் விருப்பத்திற்கேற்ப தங்கிலீஷ் அல்லது தூய தமிழ்) எழுதுகிறோம்.' },
              { q: 'வாடிக்கையாளர் கருத்துகள் மற்றும் செய்திகளுக்கு பதிலளிப்பீர்களா?', a: 'ஆம். கருத்துகள் மற்றும் நேரடி செய்திகளைக் கண்காணித்து, முகவரி மற்றும் எண்கள் போன்ற பொதுவான விவரங்களை பதிலளிப்போம், மேலும் முக்கியமான விசாரணைகளை வாட்ஸ்அப்பிற்கு அனுப்புவோம்.' },
              { q: 'ஒரு வாரத்திற்கு எத்தனை பதிவுகள் வடிவமைக்கப்பட்டு வெளியிடப்படும்?', a: 'நீங்கள் தேர்வு செய்யும் திட்டத்தைப் பொறுத்தது. எங்களது ஸ்டார்ட்டர் திட்டத்தில் வாரத்திற்கு 2 போஸ்டுகளும், குரோத் திட்டத்தில் வாரத்திற்கு 3 போஸ்டுகளும் வெளியிடப்படும்.' }
            ],
            crossTitle: 'உங்களுக்கு இந்த சேவைகளும் தேவைப்படலாம்',
            crossCards: [
              { title: 'விளம்பர மார்க்கெட்டிங்', desc: 'குறைந்த செலவில் வாடிக்கையாளர் விசாரணைகளை உடனடியாகப் பெற உதவும் கூகுள் மற்றும் மெட்டா விளம்பரங்கள்.', link: 'விளம்பர மார்க்கெட்டிங் பகுதிக்குச் செல்ல' },
              { title: 'இணையதள வடிவமைப்பு', desc: 'உங்கள் பிராண்டை மேம்படுத்தவும் வாடிக்கையாளர்களை ஈர்க்கவும் புதிதாக எழுதப்பட்ட அதிவேக இணையதளங்கள்.', link: 'இணையதள வடிவமைப்பு பகுதிக்குச் செல்ல' }
            ],
            ctaTitle: 'சமூக ஊடகங்களில் தொடர்ந்து தொழில்முறையாக இருக்க வேண்டுமா?',
            ctaDesc: 'உங்கள் பிராண்டிற்கான தனிப்பயன் உள்ளடக்கத் திட்டம் மற்றும் போஸ்டர் மாதிரிகளைப் பெற எங்களை அணுகவும்.',
            ctaBtn: 'சமூக ஊடக திட்டத்தைத் தொடங்க'
          }
        },
        'ad-marketing.html': {
          en: {
            heroH1: 'Ad Marketing Services',
            crumb: 'Ad Marketing',
            mainTitle: 'High-Yield Digital Ads Setup Designed For ROI',
            mainSub: 'SEO takes time, but local paid ad campaigns deliver customer leads immediately. We set up, write, and optimize budget-friendly Google and Meta ads to target high-intent buyers in your cities.',
            desc: 'Running paid ads on Facebook, Instagram, or Google without a clear plan can drain your marketing budget rapidly. We prevent waste by configuring precise geographic audience targets, designing attention-grabbing visual assets, and setting up conversion parameters to monitor every rupee spent.',
            includedTitle: "What's Included in this Service",
            features: [
              { title: 'Google Search Campaigns', desc: 'Target buyers searching directly for your services in local regions.' },
              { title: 'Meta Instagram & FB Ads', desc: 'Run eye-catching image ads directly on user feeds to generate interest.' },
              { title: 'Creative Visual Copy', desc: 'We design custom ad posters and write slogans in English & Tamil.' },
              { title: 'Conversion Analytics', desc: 'Track direct calls, form entries, and WhatsApp leads to calculate ROI.' }
            ],
            whoTitle: 'Who This Is For',
            whoDesc: 'Our ad marketing packages are highly optimized to deliver immediate enquiries for business owners like:',
            whoBullets: [
              'Retailers and showrooms launching seasonal product sales',
              'Clinics, doctors, dentists, and clinical testing laboratories',
              'Private institutes, colleges, and training classes seeking admissions',
              'Real estate agencies and wedding planners seeking customer inquiries'
            ],
            whoBtn: 'Start Ad Campaign',
            processTitle: 'Our Ad Setup Process',
            processSub: 'A data-focused workflow designed to minimize ad spend while maximizing leads.',
            processSteps: [
              { title: 'Audience Plan', desc: 'We analyze search queries and profile target interest groups in your local region.' },
              { title: 'Creative Building', desc: 'Designing graphic posters and writing high-converting copy in English & Tamil.' },
              { title: 'Campaign Launch', desc: 'Setting up conversion tags and deploying live campaigns with set daily caps.' },
              { title: 'Monitor & Optimize', desc: 'Pausing low-performing ads, shifting budget to top creatives, and reporting lead numbers.' }
            ],
            faqTitle: 'Ad Marketing FAQ',
            faqSub: 'Common questions about platform differences, pricing rates, and budget minimums.',
            faqs: [
              { q: 'How quickly will I start receiving inquiries from paid ads?', a: 'Almost immediately. Once campaigns are configured and approved by Google or Meta (usually takes 12 to 24 hours), the ads go live to searchers and can generate leads on the very first day.' },
              { q: 'What is the difference between Google Ads and Meta (FB/IG) Ads?', a: 'Google Ads targets active search intent: showing your listing when someone searches for "clinic in Trichy." Meta Ads targets interest-based behaviors: displaying visual product graphics to users who match demographics in your area.' },
              { q: 'Do you charge a percentage of my ad spend?', a: 'No. Unlike legacy agencies that charge a percentage of your media spend, we charge a transparent, flat monthly management fee. You pay the ad network directly, ensuring complete budget clarity.' },
              { q: 'What is the minimum ad budget required to start?', a: 'We can launch campaigns with a daily budget as low as ₹200 to ₹300 for single town/city targets. For larger campaigns covering multiple districts, we recommend starting with at least ₹500 per day.' }
            ],
            crossTitle: 'You May Also Need These Services',
            crossCards: [
              { title: 'Social Media Management', desc: 'Professional content calendar schedules and poster graphic design packages to engage Tamil audiences and build online community.', link: 'Go to Social Media' },
              { title: 'SEO Optimization', desc: 'Climb search rankings on Google for local Tamil Nadu searches and direct targeted customer calls straight to your office.', link: 'Go to SEO Optimization' }
            ],
            ctaTitle: 'Ready to Generate Sales Leads Immediately?',
            ctaDesc: 'Contact our experts to receive a customized ad campaign layout designed for your target cities.',
            ctaBtn: 'Start Ad Marketing'
          },
          ta: {
            heroH1: 'விளம்பர மார்க்கெட்டிங்',
            crumb: 'விளம்பர மார்க்கெட்டிங்',
            mainTitle: 'முதலீட்டிற்கான உடனடி பலன் தரும் டிஜிட்டல் விளம்பரங்கள்',
            mainSub: 'SEO செய்ய சில காலமாகும், ஆனால் விளம்பரங்கள் மூலம் வாடிக்கையாளர் அழைப்புகளை உடனடியாகப் பெற முடியும். உங்கள் பட்ஜெட்டிற்குள் கூகுள் மற்றும் மெட்டா விளம்பரங்களை அமைக்கிறோம்.',
            desc: 'முறையான திட்டமிடல் இல்லாமல் பேஸ்புக் அல்லது கூகுளில் விளம்பரம் செய்வது உங்கள் பட்ஜெட்டை வீணடிக்கும். நாங்கள் உங்கள் இலக்கு வாடிக்கையாளர்களைத் துல்லியமாக கண்டறிந்து, விளம்பரப் போஸ்டர்களை உருவாக்கி, ஒவ்வொரு ரூபாயின் பலனையும் கண்காணிக்கிறோம்.',
            includedTitle: 'இந்த சேவையில் சேர்க்கப்பட்டுள்ளவை',
            features: [
              { title: 'கூகுள் தேடல் விளம்பரங்கள்', desc: 'உங்கள் சேவைகளை நேரடியாக தேடும் வாடிக்கையாளர்களை இலக்காகக் கொண்டு முன்னிலைப்படுத்துதல்.' },
              { title: 'மெட்டா (FB/IG) விளம்பரங்கள்', desc: 'இன்ஸ்டாகிராம் மற்றும் பேஸ்புக் ஃபீட்களில் கவர்ச்சிகரமான போஸ்டர்கள் மூலம் வாடிக்கையாளர்களை ஈர்த்தல்.' },
              { title: 'விளம்பர வடிவமைப்பு & வாசகம்', desc: 'விளம்பர போஸ்டர்கள் வடிவமைப்பு மற்றும் தமிழ்/ஆங்கிலத்தில் விளம்பர வாசகங்களை எழுதுதல்.' },
              { title: 'விசாரணை பகுப்பாய்வு', desc: 'விளம்பரம் மூலம் வந்த அழைப்புகள், படிவங்கள் மற்றும் வாட்ஸ்அப் தொடர்புகளைக் கண்காணித்தல்.' }
            ],
            whoTitle: 'இது யாருக்கானது',
            whoDesc: 'எங்கள் விளம்பர திட்டங்கள் தங்கள் வணிகத்திற்கான வாடிக்கையாளர் அழைப்புகள் மற்றும் விசாரணைகளை உடனடியாகப் பெற விரும்பும் வணிக உரிமையாளர்களுக்காக வடிவமைக்கப்பட்டுள்ளன:',
            whoBullets: [
              'பருவகால அல்லது தள்ளுபடி விற்பனையைத் தொடங்கும் சில்லறை விற்பனையாளர்கள் மற்றும் கடைகள்',
              'விசாரணைகள் மற்றும் புதிய நோயாளிகளைத் தேடும் கிளினிக்குகள், மருத்துவர்கள் மற்றும் ஆய்வகங்கள்',
              'மாணவர் சேர்க்கையை அதிகரிக்க விரும்பும் தனியார் கல்வி நிறுவனங்கள் மற்றும் பயிற்சி வகுப்புகள்',
              'உடனடி வாடிக்கையாளர் விசாரணைகளைத் தேடும் ரியல் எஸ்டேட் மற்றும் திருமண மேலாண்மை நிறுவனங்கள்'
            ],
            whoBtn: 'விளம்பர பிரச்சாரத்தைத் தொடங்க',
            processTitle: 'விளம்பர அமைவு செயல்முறை',
            processSub: 'குறைந்த செலவில் அதிக வாடிக்கையாளர் விசாரணைகளைப் பெறுவதை உறுதி செய்யும் தரவு சார்ந்த செயல்முறை.',
            processSteps: [
              { title: 'இலக்கு வாடிக்கையாளர்', desc: 'உள்ளூர் பகுதியில் உங்கள் சேவைகளைத் தேடும் நபர்களின் விருப்பங்கள் மற்றும் தேடல்களை ஆய்வு செய்தல்.' },
              { title: 'வடிவமைப்பு & வாசகம்', desc: 'விளம்பர போஸ்டர்களை வடிவமைத்து தமிழ் மற்றும் ஆங்கிலத்தில் விளம்பர வாசகங்களை எழுதுதல்.' },
              { title: 'பிரச்சார வெளியீடு', desc: 'கண்காணிப்பு குறியீடுகளை அமைத்து, தினசரி பட்ஜெட் வரம்புகளுடன் பிரச்சாரத்தைத் தொடங்குகோல்.' },
              { title: 'மேம்படுத்தல் & அறிக்கை', desc: 'குறைந்த பலன் தரும் விளம்பரங்களை நிறுத்தி, அதிக பலன் தரும் விளம்பரங்களுக்கு பட்ஜெட்டை மாற்றி அறிக்கையளித்தல்.' }
            ],
            faqTitle: 'விளம்பர மார்க்கெட்டிங் - அடிக்கடி கேட்கப்படும் கேள்விகள்',
            faqSub: 'தள வேறுபாடுகள், கட்டணங்கள் மற்றும் பட்ஜெட் வரம்புகள் பற்றிய பொதுவான கேள்விகள்.',
            faqs: [
              { q: 'விளம்பரங்களைத் தொடங்கியவுடன் எவ்வளவு விரைவில் விசாரணைகள் வரத் தொடங்கும்?', a: 'விளம்பரங்கள் கூகுள் அல்லது மெட்டாவால் அங்கீகரிக்கப்பட்டவுடன் (பொதுவாக 12 முதல் 24 மணி நேரம் ஆகும்), அவை உடனடியாகத் தெரியத் தொடங்கும் மற்றும் முதல் நாளிலேயே அழைப்புகள் வரலாம்.' },
              { q: 'கூகுள் விளம்பரங்களுக்கும் மெட்டா விளம்பரங்களுக்கும் என்ன வித்தியாசம்?', a: 'கூகுள் விளம்பரங்கள் தேடுவோரை இலக்காகக் கொள்ளும் (எ.கா. "திருச்சியில் கிளினிக்"). மெட்டா விளம்பரங்கள் மக்களின் ஆர்வங்களின் அடிப்படையில் இன்ஸ்டாகிராம்/பேஸ்புக் பயன்படுத்துவோருக்கு போஸ்டர்களைக் காட்டும்.' },
              { q: 'விளம்பரச் செலவில் நீங்கள் ஏதேனும் கமிஷன் வசூலிக்கிறீர்களா?', a: 'இல்லை. விளம்பரச் செலவில் கமிஷன் பெறாமல், நிலையான குறைந்த மாதாந்திர மேலாண்மை கட்டணத்தை மட்டுமே பெறுகிறோம். விளம்பரக் கட்டணங்களை நீங்கள் நேரடியாக விளம்பர நிறுவனங்களுக்கு செலுத்தலாம்.' },
              { q: 'தொடங்குவதற்கு குறைந்தபட்ச விளம்பர பட்ஜெட் எவ்வளவு தேவைப்படும்?', a: 'உள்ளூர் நகரங்களை இலக்காகக் கொள்ள ஒரு நாளைக்கு ₹200 முதல் ₹300 வரை பட்ஜெட்டில் தொடங்கலாம். பல மாவட்டங்களை உள்ளடக்கிய விளம்பரங்களுக்கு ஒரு நாளைக்கு குறைந்தது ₹500 பரிந்துரைக்கிறோம்.' }
            ],
            crossTitle: 'உங்களுக்கு இந்த சேவைகளும் தேவைப்படலாம்',
            crossCards: [
              { title: 'சமூக ஊடக மேலாண்மை', desc: 'தொழில்முறை போஸ்டர்கள் வடிவமைப்பு மற்றும் ஈர்க்கும் தலைப்புகள் மூலம் சமூக ஊடகப் பக்கங்களை நிர்வகித்தல்.', link: 'சமூக ஊடகப் பகுதிக்குச் செல்ல' },
              { title: 'தேடுபொறி உகப்பாக்கம் (SEO)', desc: 'கூகுள் தேடலில் உங்கள் வணிகத்தை முதலிடத்திற்கு கொண்டு வரவும் மற்றும் நேரடி வாடிக்கையாளர் அழைப்புகளைப் பெறவும்.', link: 'SEO பகுதிக்குச் செல்ல' }
            ],
            ctaTitle: 'உடனடி வாடிக்கையாளர் அழைப்புகளைப் பெறத் தயாரா?',
            ctaDesc: 'உங்கள் இலக்கு நகரங்களுக்கான விளம்பரத் திட்டத்தைப் பெற எங்கள் வல்லுநர்களைத் தொடர்பு கொள்ளுங்கள்.',
            ctaBtn: 'விளம்பர மார்க்கெட்டிங் தொடங்க'
          }
        }
      };

      const serviceData = serviceTranslations[currentPath];
      if (serviceData) {
        const data = serviceData[lang];
        if (data) {
          const heroH1 = document.querySelector('.hero-content h1');
          if (heroH1) heroH1.innerText = data.heroH1;

          const breadcrumbs = document.querySelectorAll('.breadcrumb a, .breadcrumb span');
          if (breadcrumbs.length >= 5) {
            breadcrumbs[0].innerText = lang === 'ta' ? 'முகப்பு' : 'Home';
            breadcrumbs[2].innerText = lang === 'ta' ? 'சேவைகள்' : 'Services';
            breadcrumbs[4].innerText = data.crumb;
          }

          const mainH2 = document.querySelector('.section-header h2');
          const mainSub = document.querySelector('.section-header p.text-muted');
          if (mainH2) mainH2.innerText = data.mainTitle;
          if (mainSub) mainSub.innerText = data.mainSub;

          const descP = document.querySelector('.section-header + p');
          if (descP) descP.innerText = data.desc;

          const includedH3 = document.querySelector('.scroll-reveal > h3');
          if (includedH3) includedH3.innerText = data.includedTitle;

          const featureItems = document.querySelectorAll('.feature-item');
          featureItems.forEach((item, idx) => {
            const feat = data.features[idx];
            if (feat) {
              const h3 = item.querySelector('.feature-info h3');
              const p = item.querySelector('.feature-info p');
              if (h3) h3.innerText = feat.title;
              if (p) p.innerText = feat.desc;
            }
          });

          const whoH2 = document.querySelector('.service-meta-box h2');
          const whoP = document.querySelector('.service-meta-box p');
          const whoList = document.querySelectorAll('.service-meta-box ul li');
          const whoBtn = document.querySelector('.service-meta-box a.btn');

          if (whoH2) whoH2.innerText = data.whoTitle;
          if (whoP) whoP.innerText = data.whoDesc;
          whoList.forEach((li, idx) => {
            if (data.whoBullets[idx]) li.innerText = data.whoBullets[idx];
          });
          if (whoBtn) whoBtn.innerText = data.whoBtn;

          const processH2 = document.querySelector('.section-offwhite .section-header h2');
          const processP = document.querySelector('.section-offwhite .section-header p.text-muted');
          if (processH2) processH2.innerText = data.processTitle;
          if (processP) processP.innerText = data.processSub;

          const processSteps = document.querySelectorAll('.process-step');
          processSteps.forEach((step, idx) => {
            const stepData = data.processSteps[idx];
            if (stepData) {
              const h3 = step.querySelector('h3');
              const p = step.querySelector('p');
              if (h3) h3.innerText = stepData.title;
              if (p) p.innerText = stepData.desc;
            }
          });

          const faqAccordion = document.querySelector('.faq-accordion');
          if (faqAccordion) {
            const faqSection = faqAccordion.closest('.section');
            if (faqSection) {
              const faqH2 = faqSection.querySelector('.section-header h2');
              const faqP = faqSection.querySelector('.section-header p.text-muted');
              if (faqH2) faqH2.innerText = data.faqTitle;
              if (faqP) faqP.innerText = data.faqSub;
            }

            const faqItems = faqAccordion.querySelectorAll('.faq-item');
            faqItems.forEach((item, idx) => {
              const faqData = data.faqs[idx];
              if (faqData) {
                const h3 = item.querySelector('.faq-header h3');
                const content = item.querySelector('.faq-content');
                if (h3) h3.innerText = faqData.q;
                if (content) content.innerText = faqData.a;
              }
            });
          }

          const crosslinksSection = document.querySelector('.service-crosslinks');
          if (crosslinksSection) {
            const crossH3 = crosslinksSection.querySelector('h3');
            if (crossH3) crossH3.innerText = data.crossTitle;

            const crossCards = crosslinksSection.querySelectorAll('.crosslink-card');
            crossCards.forEach((card, idx) => {
              const cardData = data.crossCards[idx];
              if (cardData) {
                const h4 = card.querySelector('h4');
                const p = card.querySelector('p');
                const link = card.querySelector('a.service-link');
                if (h4) h4.innerText = cardData.title;
                if (p) p.innerText = cardData.desc;
                if (link) {
                  link.innerHTML = `${cardData.link} <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
                }
              }
            });
          }

          const ctaH2 = document.querySelector('.cta-band-content h2');
          const ctaP = document.querySelector('.cta-band-content p');
          const ctaBtn = document.querySelector('.cta-band-content a.btn');
          if (ctaH2) ctaH2.innerText = data.ctaTitle;
          if (ctaP) ctaP.innerText = data.ctaDesc;
          if (ctaBtn) ctaBtn.innerText = data.ctaBtn;
        }
      }
    }

    // Why Choose Us Page specific elements
    if (currentPath === 'why-us.html') {
      const heroTitle = document.getElementById('whyUsHeroTitle');
      const crumb = document.getElementById('whyUsCrumb');
      const sectionTitle = document.getElementById('whyUsSectionTitle');
      const sectionSub = document.getElementById('whyUsSectionSub');

      if (heroTitle) {
        heroTitle.innerText = lang === 'ta' ? 'ஹெப்டாஜெனிக்ஸ் சொல்யூஷன்ஸை ஏன் தேர்ந்தெடுக்க வேண்டும்' : 'Why Choose Heptagenix Solutions';
      }
      if (crumb) {
        crumb.innerText = lang === 'ta' ? 'ஏன் எங்களைத் தேர்ந்தெடுக்க வேண்டும்' : 'Why Choose Us';
      }
      if (sectionTitle) {
        sectionTitle.innerText = lang === 'ta' ? 'ஏன் எங்களைத் தேர்ந்தெடுக்க வேண்டும்' : 'Why Choose Us';
      }
      if (sectionSub) {
        sectionSub.innerText = lang === 'ta' 
          ? 'தொழில்நுட்ப சிறப்பு மற்றும் பிராந்திய வணிகப் புரிதலை நாங்கள் ஒருங்கிணைக்கிறோம்.' 
          : 'We combine technical excellence with regional business understanding.';
      }

      // 4 Cards
      const cardTitles = {
        ta: [
          'மலிவான விலை',
          '1-க்கு-1 நேரடி வழிகாட்டுதல்',
          'தமிழ்நாடு சிறப்பு கவனம்',
          'தனிப்பயன் குறியீட்டு செயல்திறன்'
        ],
        en: [
          'Affordable Pricing',
          '1-on-1 Guidance',
          'Tamil Nadu Specialization',
          'Custom-Coded Performance'
        ]
      };

      const cardDescs = {
        ta: [
          'வளர்ந்து வரும் உள்ளூர் சில்லறை மற்றும் சேவை கடைகளின் சரியான தேவைகளுக்கு ஏற்ப வடிவமைக்கப்பட்ட மலிவான கட்டணத் திட்டங்கள்.',
          'வடிவமைப்பு, உருவாக்கம் மற்றும் வெளியீட்டு செயல்முறை முழுவதும் நேரடித் தொடர்பு மற்றும் பிரத்யேக ஆதரவு.',
          'தமிழக வாடிக்கையாளர்களுக்காகவே பிரத்யேகமாக வடிவமைக்கப்பட்ட இணையதளங்கள் மற்றும் விளம்பரங்கள். இதில் தமிழ்-ஆங்கில இருமொழி விளம்பர உள்ளடக்கங்கள் மற்றும் மாநிலத்தின் அனைத்து மாவட்டங்களில் உள்ள சிறு-குறு தொழில் தேவைகளுக்கான பிராந்திய கட்டணங்கள் அடங்கும்.',
          'உங்கள் தளம் வேகமாகவும், பாதுகாப்பாகவும் மற்றும் கூகுளில் முன்னணியில் இருப்பதை உறுதி செய்ய புதிதாக சுத்தமான, செமண்டிக் குறியீட்டை எழுதுகிறோம்.'
        ],
        en: [
          'Tailored pricing plans optimized to suit the exact requirements of emerging local retail and service shops.',
          'Direct communication and dedicated support throughout the design, development, and launch process.',
          'We design websites and campaigns tailored specifically for Tamil Nadu clients, offering bilingual English-Tamil copywriting, local market insights, and regional pricing to help local businesses scale.',
          'We write clean, semantic code from scratch to ensure your site loads instantly and ranks high on Google.'
        ]
      };

      for (let i = 1; i <= 4; i++) {
        const titleEl = document.getElementById(`whyCardTitle${i}`);
        const descEl = document.getElementById(`whyCardDesc${i}`);
        if (titleEl) titleEl.innerText = cardTitles[lang][i - 1];
        if (descEl) descEl.innerText = cardDescs[lang][i - 1];
      }

      // Founder Section
      const founderRole = document.getElementById('founderRole');
      const founderName = document.getElementById('founderName');
      const founderBio1 = document.getElementById('founderBio1');
      const founderBio2 = document.getElementById('founderBio2');
      const linkedinBtn = document.getElementById('linkedinBtn');

      if (founderRole) {
        founderRole.innerText = lang === 'ta' ? 'நிறுவனர் & முதன்மை நிர்வாக அதிகாரி (Founder & CEO)' : 'Founder & CEO';
      }
      if (founderName) {
        founderName.innerText = lang === 'ta' ? 'கார்த்திகேயன் ஈஸ்வரன்' : 'Karthikeyan Eswaran';
      }
      if (founderBio1) {
        founderBio1.innerText = lang === 'ta'
          ? 'ஹெப்டாஜெனிக்ஸ் சொல்யூஷன்ஸ் சார்பாக உங்களை வரவேற்கிறோம்! தமிழ்நாட்டின் சிறு மற்றும் நடுத்தர வணிகங்களுக்கு உயர்தர இணையதள உருவாக்கம், தனிப்பயன் மென்பொருள் வடிவமைப்பு மற்றும் விளம்பர பிரச்சாரங்களை வழங்குவதற்காகவே இந்த டிஜிட்டல் நிறுவனத்தை நான் தொடங்கினேன்.'
          : 'Welcome to Heptagenix Solutions! As the Founder and CEO, I started this digital agency to bring high-performance web development, custom software engineering, and data-driven marketing campaigns to small businesses across Tamil Nadu.';
      }
      if (founderBio2) {
        founderBio2.innerText = lang === 'ta'
          ? 'எங்கள் நோக்கம் எளிதானது: உள்ளூர் கடை உரிமையாளர்கள், பிராந்திய பிராண்டுகள் மற்றும் வளர்ந்து வரும் விநியோகஸ்தர்களுக்கு உலகத்தரம் வாய்ந்த டிஜிட்டல் சேவைகளை மலிவான விலையில் கிடைக்கச் செய்வது. மெதுவான மற்றும் சிக்கலான வார்ப்புருக்களைப் பயன்படுத்தாமல், வேகமான, பாதுகாப்பான மற்றும் நன்கு உகந்த இணையதளங்கள் மூலம் உங்கள் வணிகத்தின் விற்பனையை அதிகரிக்கிறோம்.'
          : 'Our mission is simple: to make enterprise-grade digital services accessible and affordable for local shop owners, regional brands, and rising distributors. By using custom-coded layouts instead of bloated, slow templates, we deliver fast, secure, and highly optimized platforms that establish authority and scale business leads.';
      }
      if (linkedinBtn) {
        linkedinBtn.innerHTML = lang === 'ta'
          ? `<svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>லிங்க்டின் சுயவிவரம் (LinkedIn)`
          : `<svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>LinkedIn Profile`;
      }
    }
  };

  const applyTranslations = (lang) => {
    // 1. Set HTML lang attribute
    document.documentElement.setAttribute('lang', lang);

    // 2. Translate Header Navigation Links
    const navLinks = {
      'index.html': 'nav-home',
      'about.html': 'nav-about',
      'pricing.html': 'nav-pricing',
      'contact.html': 'nav-contact',
      'why-us.html': 'nav-why-us'
    };
    
    document.querySelectorAll('.nav-menu > .nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (navLinks[href]) {
        link.innerText = translations[lang][navLinks[href]];
      }
    });

    // Dropdown Services title toggle
    const servicesToggle = document.querySelector('.nav-item-dropdown > .dropdown-toggle');
    if (servicesToggle) {
      servicesToggle.innerHTML = `${translations[lang]['nav-services']} <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>`;
    }

    const dropdownLinks = {
      'web-development.html': 'service-web',
      'hosting-maintenance.html': 'service-host',
      'seo-optimization.html': 'service-seo',
      'fullstack-applications.html': 'service-full',
      'social-media-management.html': 'service-social',
      'ad-marketing.html': 'service-ads'
    };
    
    document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(link => {
      const href = link.getAttribute('href');
      if (dropdownLinks[href]) {
        link.innerText = translations[lang][dropdownLinks[href]];
      }
    });

    // 3. Translate Footer Links & Titles
    document.querySelectorAll('.footer-links a').forEach(link => {
      const href = link.getAttribute('href');
      if (dropdownLinks[href]) {
        link.innerText = translations[lang][dropdownLinks[href]];
      } else if (navLinks[href]) {
        link.innerText = translations[lang][navLinks[href]];
      }
    });


    const footerTitles = document.querySelectorAll('.footer-title');
    if (footerTitles.length >= 3) {
      footerTitles[0].innerText = translations[lang]['footer-quick-links'];
      footerTitles[1].innerText = translations[lang]['footer-our-services'];
      footerTitles[2].innerText = translations[lang]['footer-get-in-touch'];
    }

    const footerContactItems = document.querySelectorAll('.footer-contact-item');
    if (footerContactItems.length >= 1) {
      const p1 = footerContactItems[0].querySelector('p');
      const p2 = footerContactItems[0].querySelector('p + p');
      if (p1) p1.innerText = translations[lang]['footer-serving'];
      if (p2) p2.innerText = translations[lang]['footer-serving-sub'];
    }

    const footerMarqueeText = document.getElementById('footerMarqueeText');
    if (footerMarqueeText) {
      footerMarqueeText.innerText = translations[lang]['footer-marquee'];
    }

    // 4. Translate Chatbot Tooltip
    const chatbotTooltip = document.getElementById('whatsappTooltip');
    if (chatbotTooltip) chatbotTooltip.innerText = translations[lang]['whatsapp-tooltip'];

    // 5. Translate Header Language Switch Toggle Text
    const langBtnText = document.querySelector('#langSwitchBtn .lang-text');
    if (langBtnText) langBtnText.innerText = translations[lang]['lang-btn-text'];

    // 6. Page Content Custom Translations (Headings, buttons, details)
    translatePageContent(lang);
  };

  // Language button handler
  const langSwitchBtn = document.getElementById('langSwitchBtn');
  if (langSwitchBtn) {
    langSwitchBtn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'ta' : 'en';
      localStorage.setItem('preferredLang', currentLang);
      applyTranslations(currentLang);
    });
  }

  // Run translation on load
  applyTranslations(currentLang);

  // ==========================================
  // FLOATING WHATSAPP CHATBOT WIDGET
  // ==========================================
  const whatsappTooltip = document.getElementById('whatsappTooltip');
  const whatsappButton = document.getElementById('whatsappButton');

  if (whatsappTooltip && whatsappButton) {
    // Show tooltip welcome bubble after 4 seconds
    setTimeout(() => {
      whatsappTooltip.classList.add('active');
    }, 4000);

    // Auto-hide the welcome bubble after 14 seconds (10 seconds display)
    setTimeout(() => {
      whatsappTooltip.classList.remove('active');
    }, 14000);

    // Show tooltip on hover
    whatsappButton.addEventListener('mouseenter', () => {
      whatsappTooltip.classList.add('active');
    });

    // Hide tooltip when cursor leaves button
    whatsappButton.addEventListener('mouseleave', () => {
      whatsappTooltip.classList.remove('active');
    });
  }
});
