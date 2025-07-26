// script.js - Complete Consolidated JavaScript for Nebula Blog

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCX9UYMLfhVgABq9Jr_7mfmxPGJ8IDUs4A",
    authDomain: "blog-app-3d4b6.firebaseapp.com",
    projectId: "blog-app-3d4b6",
    storageBucket: "blog-app-3d4b6.appspot.com",
    messagingSenderId: "333584432477",
    appId: "1:333584432477:web:f950a75932835568be3cb4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const elements = {
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mainNav: document.getElementById('mainNav'),
    closeNavBtn: document.getElementById('closeNavBtn'),
    blogForm: document.getElementById('blogForm'),
    blogFormContainer: document.getElementById('blogFormContainer'),
    postsGrid: document.getElementById('postsGrid'),
    pendingPostsGrid: document.getElementById('pendingPostsGrid'),
    writeBlogBtn: document.getElementById('writeBlogBtn'),
    authButton: document.getElementById('authButton'),
    userProfile: document.getElementById('userProfile'),
    userName: document.getElementById('userName'),
    adminLink: document.getElementById('adminLink'),
    loginModal: document.getElementById('loginModal'),
    registerModal: document.getElementById('registerModal'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    closeLoginModal: document.getElementById('closeLoginModal'),
    closeRegisterModal: document.getElementById('closeRegisterModal'),
    showRegister: document.getElementById('showRegister'),
    showLogin: document.getElementById('showLogin'),
    togglePassword: document.getElementById('togglePassword'),
    toggleRegisterPassword: document.getElementById('toggleRegisterPassword'),
    loginPassword: document.getElementById('loginPassword'),
    registerPassword: document.getElementById('registerPassword'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    adminSection: document.getElementById('admin'),
    approvalModal: document.getElementById('approvalModal'),
    closeApprovalModal: document.getElementById('closeApprovalModal'),
    approveBlogBtn: document.getElementById('approveBlog'),
    rejectBlogBtn: document.getElementById('rejectBlog'),
    privacyModal: document.getElementById('privacyModal'),
    closePrivacyModal: document.getElementById('closePrivacyModal'),
    termsModal: document.getElementById('termsModal'),
    closeTermsModal: document.getElementById('closeTermsModal'),
    contactModal: document.getElementById('contactModal'),
    closeContactModal: document.getElementById('closeContactModal'),
    scrollToTopBtn: document.getElementById('scrollToTop')
};

// App State
const state = {
    isLoggedIn: false,
    currentUser: null,
    currentBlogId: null,
    isNavAnimating: false,
    isAdmin: false,
    adminEmails: ['mohitfrontendev@gmail.com']
};

// Utility Functions
const utils = {
    showToast: (message, type = 'success') => {
        elements.toastMessage.textContent = message;
        elements.toast.className = `toast ${type} show`;
        const icon = elements.toast.querySelector('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 
                         type === 'error' ? 'fas fa-exclamation-circle' : 
                         'fas fa-exclamation-triangle';
        setTimeout(() => {
            elements.toast.classList.remove('show');
            elements.toast.classList.add('hide');
            setTimeout(() => elements.toast.classList.remove('hide'), 500);
        }, 3000);
    },

    updateUIForLoginStatus: () => {
        if (state.isLoggedIn) {
            elements.userProfile.style.display = 'flex';
            elements.userName.textContent = state.currentUser.displayName || state.currentUser.email;
            elements.adminLink.style.display = state.isAdmin ? 'block' : 'none';
            elements.writeBlogBtn.style.display = 'block';
            elements.authButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sign Out';
            elements.authButton.classList.add('sign-out');
            setTimeout(() => {
                elements.writeBlogBtn.style.opacity = '1';
                elements.writeBlogBtn.style.transform = 'translateY(0)';
            }, 100);
        } else {
            elements.userProfile.style.display = 'none';
            elements.adminLink.style.display = 'none';
            elements.writeBlogBtn.style.display = 'none';
            elements.blogFormContainer.classList.remove('show');
            elements.authButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            elements.authButton.classList.remove('sign-out');
            elements.adminSection.style.display = 'none';
        }
    },

    toggleNav: () => {
        if (state.isNavAnimating) return;
        state.isNavAnimating = true;
        const isActive = elements.mainNav.classList.toggle('active');
        elements.mobileMenuBtn.classList.toggle('active');
        elements.mobileMenuBtn.setAttribute('aria-expanded', isActive);
        setTimeout(() => state.isNavAnimating = false, 400);
    },

    createParticles: () => {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        document.querySelector('.hero').appendChild(particlesContainer);

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 4 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particlesContainer.appendChild(particle);
        }
    },

    addRippleEffect: (buttons) => {
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                ripple.style.left = `${e.clientX - rect.left}px`;
                ripple.style.top = `${e.clientY - rect.top}px`;
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }
};

// Blog Functions
const blogFunctions = {
    loadBlogs: () => {
        elements.postsGrid.innerHTML = '';
        
        // Default blogs
        const defaultBlogs = [
            {
                id: "default1",
                title: "Labnol",
                author: "Amit Agarwal",
                image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
                content: "Labnol, run by Amit Agarwal, is India's leading tech blog...",
                date: "Ongoing",
                url: "https://www.labnol.org/",
                status: "approved"
            },
            // ... other default blogs
        ];

        defaultBlogs.forEach(blog => {
            if (blog.status === 'approved') {
                blogFunctions.createBlogCard(blog, elements.postsGrid);
            }
        });

        // Load from Firestore
        db.collection('blogs').where('status', '==', 'approved').get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const blog = doc.data();
                    blog.id = doc.id;
                    blogFunctions.createBlogCard(blog, elements.postsGrid);
                });
            })
            .catch((error) => {
                console.error("Error getting blogs: ", error);
                utils.showToast('Error loading blogs', 'error');
            });
    },

    createBlogCard: (blog, container) => {
        const excerpt = blog.content.length > 100 ? 
            blog.content.substring(0, 100) + '...' : blog.content;

        const blogCard = document.createElement('div');
        blogCard.className = 'blog-card';
        blogCard.innerHTML = `
            <div class="blog-image">
                <img src="${blog.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1470&q=80'}" alt="${blog.title}">
            </div>
            <div class="blog-content">
                <h3 class="blog-title">${blog.title}</h3>
                <p class="blog-author">
                    <i class="fas fa-user"></i> ${blog.author} • ${blog.date || new Date().toLocaleDateString()}
                </p>
                <p class="blog-excerpt">${excerpt}</p>
                <a href="#" class="read-more" data-id="${blog.id}">
                    Read More <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

        container.appendChild(blogCard);
        setTimeout(() => {
            blogCard.style.opacity = '1';
            blogCard.style.transform = 'translateY(0)';
        }, container.children.length * 100);

        blogCard.querySelector('.read-more').addEventListener('click', function(e) {
            e.preventDefault();
            blogFunctions.openModal(blog);
        });
    },

    loadPendingBlogs: () => {
        elements.pendingPostsGrid.innerHTML = '';

        db.collection('blogs').where('status', '==', 'pending').get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const blog = doc.data();
                    blog.id = doc.id;
                    blogFunctions.createPendingBlogCard(blog, elements.pendingPostsGrid);
                });

                if (querySnapshot.empty) {
                    elements.pendingPostsGrid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1 / -1;">No pending blogs to review</p>';
                }
            })
            .catch((error) => {
                console.error("Error getting pending blogs: ", error);
                utils.showToast('Error loading pending blogs', 'error');
            });
    },

    createPendingBlogCard: (blog, container) => {
        const excerpt = blog.content.length > 100 ? 
            blog.content.substring(0, 100) + '...' : blog.content;

        const blogCard = document.createElement('div');
        blogCard.className = 'blog-card';
        blogCard.innerHTML = `
            <div class="blog-image">
                <img src="${blog.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1470&q=80'}" alt="${blog.title}">
            </div>
            <div class="blog-content">
                <h3 class="blog-title">${blog.title}</h3>
                <p class="blog-author">
                    <i class="fas fa-user"></i> ${blog.author} • ${blog.date || new Date().toLocaleDateString()}
                </p>
                <p class="blog-excerpt">${excerpt}</p>
                <a href="#" class="read-more" data-id="${blog.id}">
                    Review <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

        const statusBadge = document.createElement('div');
        statusBadge.className = 'status-badge status-pending';
        statusBadge.textContent = 'pending';
        blogCard.querySelector('.blog-content').appendChild(statusBadge);

        container.appendChild(blogCard);

        setTimeout(() => {
            blogCard.style.opacity = '1';
            blogCard.style.transform = 'translateY(0)';
        }, container.children.length * 100);

        blogCard.querySelector('.read-more').addEventListener('click', function(e) {
            e.preventDefault();
            state.currentBlogId = blog.id;
            blogFunctions.openApprovalModal(blog);
        });
    },

    sendAdminNotification: (blogId, blogTitle, authorName) => {
        db.collection('notifications').add({
            type: 'blog_approval',
            blogId: blogId,
            title: `New Blog Pending Approval: ${blogTitle}`,
            message: `${authorName} has submitted a new blog for review.`,
            status: 'unread',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            recipient: 'admin'
        })
        .then(() => {
            console.log("Admin notification sent successfully");
            db.collection('blogs').doc(blogId).update({
                adminNotified: true
            });
        })
        .catch((error) => {
            console.error("Error sending notification: ", error);
        });
    },

    openModal: (blog) => {
        document.getElementById('modalTitle').textContent = blog.title;
        document.getElementById('modalAuthor').textContent = `${blog.author} • ${blog.date || new Date().toLocaleDateString()}`;
        document.getElementById('modalImage').src = blog.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1470&q=80';
        document.getElementById('modalText').innerHTML = blog.content.replace(/\n/g, '<br><br>');
        
        const modalLink = document.getElementById('modalLink');
        if (blog.url) {
            modalLink.href = blog.url;
            modalLink.style.display = 'inline-flex';
        } else {
            modalLink.style.display = 'none';
        }

        elements.blogModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    },

    openApprovalModal: (blog) => {
        document.getElementById('approvalAuthor').textContent = `${blog.author} • ${blog.date || new Date().toLocaleDateString()}`;
        document.getElementById('approvalImage').src = blog.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1470&q=80';
        document.getElementById('approvalText').innerHTML = blog.content.replace(/\n/g, '<br><br>');

        elements.approvalModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
};

// Event Listeners
const setupEventListeners = () => {
    // Navigation
    elements.mobileMenuBtn.addEventListener('click', utils.toggleNav);
    elements.closeNavBtn.addEventListener('click', utils.toggleNav);

    // Auth
    elements.authButton.addEventListener('click', function(e) {
        e.preventDefault();
        if (state.isLoggedIn) {
            auth.signOut().then(() => {
                utils.showToast('Logged out successfully!');
            }).catch((error) => {
                utils.showToast('Error signing out: ' + error.message, 'error');
            });
        } else {
            elements.loginModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            document.getElementById('loginEmail').focus();
        }
    });

    // Blog Form
    elements.blogForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const title = document.getElementById('blogTitle').value;
        const image = document.getElementById('blogImage').value || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1470&q=80";
        const content = document.getElementById('blogContent').value;
        const date = new Date().toLocaleDateString();

        const newBlog = {
            title,
            author: state.currentUser.displayName || state.currentUser.email,
            image,
            content,
            date,
            userId: state.currentUser.uid,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        db.collection('blogs').add(newBlog)
            .then((docRef) => {
                blogFunctions.sendAdminNotification(docRef.id, title, state.currentUser.displayName || state.currentUser.email);
                elements.blogForm.reset();
                elements.blogFormContainer.classList.remove('show');
                elements.writeBlogBtn.innerHTML = '<i class="fas fa-pen-nib"></i> Write a Blog';
                utils.showToast('Your blog has been submitted for admin approval!', 'warning');
                document.getElementById('blogs').scrollIntoView({ behavior: 'smooth' });
            })
            .catch((error) => {
                console.error("Error adding blog: ", error);
                utils.showToast('Error submitting blog: ' + error.message, 'error');
            });
    });

    // ... [Include all other event listeners from previous code]
};

// Initialize App
const init = () => {
    setupEventListeners();
    utils.createParticles();
    utils.addRippleEffect(document.querySelectorAll('.cta-button, .auth-button, .submit-btn, .write-blog-btn, .auth-btn'));

    // Auth State Listener
    auth.onAuthStateChanged((user) => {
        if (user) {
            state.isLoggedIn = true;
            state.currentUser = user;
            state.isAdmin = state.adminEmails.includes(user.email);
            utils.updateUIForLoginStatus();
            blogFunctions.loadBlogs();

            if (state.isAdmin) {
                blogFunctions.loadPendingBlogs();
            }
        } else {
            state.isLoggedIn = false;
            state.currentUser = null;
            state.isAdmin = false;
            utils.updateUIForLoginStatus();
            blogFunctions.loadBlogs();
        }
    });

    // Scroll to Top
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            elements.scrollToTopBtn.classList.add('show');
        } else {
            elements.scrollToTopBtn.classList.remove('show');
        }
    });

    elements.scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};

// Start the app
document.addEventListener('DOMContentLoaded', init);
