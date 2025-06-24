// 🚀 FUTURISTIC FASHION UI IMPLEMENTATION
// AURALO ULTRA PREMIUM EXPERIENCE

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. 🌊 LIQUID METAL MORPHING INTERFACE
    const initLiquidMetal = () => {
        // Create liquid metal sections
        const sections = document.querySelectorAll('.hero-section, .product-showcase, .benefits-grid');
        sections.forEach(section => {
            section.classList.add('liquid-metal-section');
        });
        
        // Add mercury buttons
        const buttons = document.querySelectorAll('.add-to-cart, .cta-button');
        buttons.forEach(button => {
            button.classList.add('mercury-button');
            
            // Ripple effect on click
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                ripple.className = 'mercury-ripple';
                
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                
                this.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });
        
        // Liquid navigation
        const nav = document.querySelector('.navbar');
        if (nav) {
            nav.classList.add('frosted-nav');
            
            // Dynamic blur on scroll
            let lastScroll = 0;
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;
                
                if (currentScroll > lastScroll && currentScroll > 100) {
                    nav.style.background = 'rgba(255, 255, 255, 0.02)';
                    nav.style.backdropFilter = 'blur(30px) saturate(200%)';
                } else {
                    nav.style.background = 'rgba(255, 255, 255, 0.05)';
                    nav.style.backdropFilter = 'blur(20px) saturate(180%)';
                }
                
                lastScroll = currentScroll;
            });
        }
    };
    
    // 2. 🎆 HOLOGRAPHIC 3D PRODUCT SHOWCASE
    const init3DShowcase = () => {
        const productImages = document.querySelectorAll('.product-image, .hero-image img');
        
        productImages.forEach(img => {
            const wrapper = document.createElement('div');
            wrapper.className = 'holographic-showcase';
            
            const product3D = document.createElement('div');
            product3D.className = 'holographic-product product-3d';
            
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(product3D);
            product3D.appendChild(img);
            
            img.classList.add('product-3d-image');
            
            // Add holographic annotations
            const annotations = [
                { text: 'PREMIUM ECO-FABRIC', top: '20%', left: '75%' },
                { text: '100% SUSTAINABLE', top: '50%', right: '10%' },
                { text: 'LUXURY COMFORT', bottom: '20%', left: '70%' }
            ];
            
            annotations.forEach((ann, index) => {
                const annotation = document.createElement('div');
                annotation.className = 'holographic-annotation';
                annotation.textContent = ann.text;
                Object.keys(ann).forEach(key => {
                    if (key !== 'text') {
                        annotation.style[key] = ann[key];
                    }
                });
                annotation.style.animationDelay = `${index * 0.5}s`;
                product3D.appendChild(annotation);
            });
            
            // 3D rotation on mouse move
            wrapper.addEventListener('mousemove', (e) => {
                const rect = wrapper.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                const rotateY = (x - 0.5) * 30;
                const rotateX = (0.5 - y) * 20;
                
                product3D.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(50px)`;
            });
            
            wrapper.addEventListener('mouseleave', () => {
                product3D.style.transform = 'rotateY(0) rotateX(0) translateZ(0)';
            });
        });
    };
    
    // 3. ✨ PARTICLE ECOSYSTEM
    const initParticleSystem = () => {
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const maxParticles = 100;
        
        class Particle {
            constructor(x, y) {
                this.x = x || Math.random() * canvas.width;
                this.y = y || Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;
                this.opacity = Math.random() * 0.5 + 0.5;
                this.hue = Math.random() * 60 + 180; // Blue to purple range
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                
                if (this.size > 0.2) this.size -= 0.01;
                if (this.opacity > 0) this.opacity -= 0.005;
                
                // Wrap around screen
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
            }
            
            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = `hsl(${this.hue}, 100%, 70%)`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        
        // Create initial particles
        for (let i = 0; i < maxParticles / 2; i++) {
            particles.push(new Particle());
        }
        
        // Sparkle trail on mouse move
        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Create sparkle trail
            if (Math.random() > 0.7 && particles.length < maxParticles) {
                particles.push(new Particle(mouseX, mouseY));
            }
        });
        
        // Explosion effect on button click
        document.querySelectorAll('.add-to-cart, .cta-button').forEach(button => {
            button.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // Create explosion
                for (let i = 0; i < 20; i++) {
                    const particle = new Particle(centerX, centerY);
                    particle.speedX = (Math.random() - 0.5) * 10;
                    particle.speedY = (Math.random() - 0.5) * 10;
                    particle.size = Math.random() * 5 + 2;
                    particles.push(particle);
                }
            });
        });
        
        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((particle, index) => {
                particle.update();
                particle.draw();
                
                // Remove dead particles
                if (particle.opacity <= 0 || particle.size <= 0.2) {
                    particles.splice(index, 1);
                }
            });
            
            requestAnimationFrame(animate);
        }
        
        animate();
        
        // Resize handler
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    };
    
    // 4. 🔮 GLASSMORPHISM WITH DEPTH
    const initGlassmorphism = () => {
        // Convert sections to glass panels
        const sections = document.querySelectorAll('.store-availability, .checkout-comparison, .testimonials');
        sections.forEach((section, index) => {
            section.classList.add('glass-panel', `glass-depth-${(index % 3) + 1}`);
        });
        
        // Create floating glass cards
        const cards = document.querySelectorAll('.benefit-card, .comparison-card');
        cards.forEach(card => {
            card.classList.add('glass-panel', 'glass-depth-2');
            
            // Parallax effect on mouse move
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                const moveX = (x - 0.5) * 20;
                const moveY = (y - 0.5) * 20;
                
                card.style.transform = `translate(${moveX}px, ${moveY}px) rotateX(${-moveY}deg) rotateY(${moveX}deg)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translate(0, 0) rotateX(0) rotateY(0)';
            });
        });
    };
    
    // 5. ⚡ KINETIC TYPOGRAPHY SYSTEM
    const initKineticTypography = () => {
        // Liquid text for headlines
        const headlines = document.querySelectorAll('h1, h2');
        headlines.forEach(headline => {
            headline.classList.add('liquid-text');
        });
        
        // Glitch text for urgency
        const urgencyElements = document.querySelectorAll('.countdown-timer, .stock-text, .sale-price');
        urgencyElements.forEach(element => {
            element.classList.add('glitch-text');
            element.setAttribute('data-text', element.textContent);
        });
        
        // Wave text animation
        const testimonials = document.querySelectorAll('.testimonial-text');
        testimonials.forEach(testimonial => {
            const text = testimonial.textContent;
            testimonial.innerHTML = '';
            testimonial.classList.add('wave-text');
            
            text.split('').forEach((char, i) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.setProperty('--i', i);
                testimonial.appendChild(span);
            });
        });
        
        // 3D text for CTAs
        const ctaTexts = document.querySelectorAll('.add-to-cart, .cta-button');
        ctaTexts.forEach(cta => {
            cta.classList.add('text-3d');
        });
        
        // Neon glow for important elements
        const importantElements = document.querySelectorAll('.sale-badge, .discount-percentage');
        importantElements.forEach(element => {
            element.classList.add('neon-glow');
        });
    };
    
    // Initialize all systems
    console.log('🚀 Initializing Futuristic Fashion UI...');
    
    initLiquidMetal();
    init3DShowcase();
    initParticleSystem();
    initGlassmorphism();
    initKineticTypography();
    
    console.log('✨ Futuristic Fashion UI Loaded!');
    console.log('🌊 Liquid Metal Interface Active');
    console.log('🎆 3D Holographic Showcase Ready');
    console.log('✨ Particle Ecosystem Running');
    console.log('🔮 Glassmorphism Engaged');
    console.log('⚡ Kinetic Typography System Online');
});