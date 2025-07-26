// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyCX9UYMLfhVgABq9Jr_7mfmxPGJ8IDUs4A",
  authDomain: "blog-app-3d4b6.firebaseapp.com",
  projectId: "blog-app-3d4b6",
  storageBucket: "blog-app-3d4b6.firebasestorage.app",
  messagingSenderId: "333584432477",
  appId: "1:333584432477:web:f950a75932835568be3cb4",
  measurementId: "G-56NY6VLYQ8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    const closeNavBtn = document.getElementById('closeNavBtn');
    const blogForm = document.getElementById('blogForm');
    const blogFormContainer = document.getElementById('blogFormContainer');
    const postsGrid = document.getElementById('postsGrid');
    const pendingPostsGrid = document.getElementById('pendingPostsGrid');
    const writeBlogBtn = document.getElementById('writeBlogBtn');
    const authButton = document.getElementById('authButton');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const adminLink = document.getElementById('adminLink');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const togglePassword = document.getElementById('togglePassword');
    const loginPassword = document.getElementById('loginPassword');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const adminSection = document.getElementById('admin');
    const approvalModal = document.getElementById('approvalModal');
    const closeApprovalModal = document.getElementById('closeApprovalModal');
    const approveBlogBtn = document.getElementById('approveBlog');
    const rejectBlogBtn = document.getElementById('rejectBlog');

    let isLoggedIn = false;
    let currentUser = null;
    let currentBlogId = null;
    let isNavAnimating = false;
    let isAdmin = false;

    // Admin emails (in a real app, this would be stored in Firebase)
    const adminEmails = ['mohitfrontendev@gmail.com'];

    function showToast(message, type = 'success') {
        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;

        const icon = toast.querySelector('i');
        if (type === 'success') {
            icon.className = 'fas fa-check-circle';
        } else if (type === 'error') {
            icon.className = 'fas fa-exclamation-circle';
        } else if (type === 'warning') {
            icon.className = 'fas fa-exclamation-triangle';
        }

        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');

            setTimeout(() => {
                toast.classList.remove('hide');
            }, 500);
        }, 3000);
    }

    function updateUIForLoginStatus() {
        if (isLoggedIn) {
            userProfile.style.display = 'flex';
            userName.textContent = currentUser.displayName || currentUser.email;

            // Show admin link if user is admin
            if (isAdmin) {
                adminLink.style.display = 'block';
            } else {
                adminLink.style.display = 'none';
            }

            writeBlogBtn.style.display = 'block';
            authButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sign Out';
            authButton.classList.add('sign-out');

            // Animate the write blog button
            setTimeout(() => {
                writeBlogBtn.style.opacity = '1';
                writeBlogBtn.style.transform = 'translateY(0)';
            }, 100);
        } else {
            userProfile.style.display = 'none';
            adminLink.style.display = 'none';
            writeBlogBtn.style.display = 'none';
            blogFormContainer.classList.remove('show');
            authButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            authButton.classList.remove('sign-out');
            writeBlogBtn.innerHTML = '<i class="fas fa-pen-nib"></i> Write a Blog';
            adminSection.style.display = 'none';
        }
    }

    function toggleNav() {
        if (isNavAnimating) return;
        isNavAnimating = true;

        const isActive = mainNav.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
        mobileMenuBtn.setAttribute('aria-expanded', isActive);

        setTimeout(() => {
            isNavAnimating = false;
        }, 400);
    }

    mobileMenuBtn.addEventListener('click', toggleNav);
    closeNavBtn.addEventListener('click', toggleNav);

    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (mainNav.classList.contains('active')) {
                toggleNav();
            }
        });
    });

    authButton.addEventListener('click', function (e) {
        e.preventDefault();
        if (isLoggedIn) {
            auth.signOut().then(() => {
                showToast('Logged out successfully!');
            }).catch((error) => {
                showToast('Error signing out: ' + error.message, 'error');
            });
        } else {
            loginModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            document.getElementById('loginEmail').focus();
        }
    });

    closeLoginModal.addEventListener('click', function () {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    closeRegisterModal.addEventListener('click', function () {
        registerModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    showRegister.addEventListener('click', function (e) {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
        document.getElementById('registerUsername').focus();
    });

    showLogin.addEventListener('click', function (e) {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
        document.getElementById('loginEmail').focus();
    });

    window.addEventListener('click', function (e) {
        if (e.target === loginModal || e.target === registerModal) {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    togglePassword.addEventListener('click', function () {
        const type = loginPassword.type === 'password' ? 'text' : 'password';
        loginPassword.type = type;
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Firebase Auth State Listener
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            isLoggedIn = true;
            currentUser = user;

            // Check if user is admin
            isAdmin = adminEmails.includes(user.email);

            updateUIForLoginStatus();
            loadBlogs();

            if (isAdmin) {
                loadPendingBlogs();
            }
        } else {
            // User is signed out
            isLoggedIn = false;
            currentUser = null;
            isAdmin = false;
            updateUIForLoginStatus();
            loadBlogs();
        }
    });

    // Login Form Submission
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Set persistence based on remember me checkbox
        const persistence = rememberMe ?
            firebase.auth.Auth.Persistence.LOCAL :
            firebase.auth.Auth.Persistence.SESSION;

        auth.setPersistence(persistence)
            .then(() => {
                return auth.signInWithEmailAndPassword(email, password);
            })
            .then(() => {
                loginModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                loginForm.reset();
                showToast('Logged in successfully!');
            })
            .catch((error) => {
                showToast('Error: ' + error.message, 'error');
            });
    });

    // Register Form Submission
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const username = document.getElementById('registerUsername').value;

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Update user profile with display name
                return userCredential.user.updateProfile({
                    displayName: username
                });
            })
            .then(() => {
                registerModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                registerForm.reset();
                showToast('Registration successful! Please login.');
                loginModal.style.display = 'block';
                document.getElementById('loginEmail').focus();
            })
            .catch((error) => {
                showToast('Error: ' + error.message, 'error');
            });
    });

    userProfile.addEventListener('click', function () {
        auth.signOut().then(() => {
            showToast('Logged out successfully!');
        }).catch((error) => {
            showToast('Error signing out: ' + error.message, 'error');
        });
    });

    writeBlogBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!isLoggedIn) {
            loginModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            return;
        }
        blogFormContainer.classList.toggle('show');
        if (blogFormContainer.classList.contains('show')) {
            document.getElementById('blogTitle').focus();
            document.getElementById('create').scrollIntoView({ behavior: 'smooth' });
            this.innerHTML = '<i class="fas fa-times"></i> Cancel';
        } else {
            this.innerHTML = '<i class="fas fa-pen-nib"></i> Write a Blog';
        }
    });

    // Default blogs data
    const defaultBlogs = [
        {
            id: "default1",
            title: "Labnol",
            author: "Amit Agarwal",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
            content: "Labnol, run by Amit Agarwal, is India's leading tech blog, offering practical guides on web development, JavaScript, Google Apps Script, and automation tools. It's a go-to resource for developers seeking beginner-friendly tutorials and advanced scripting tips.",
            date: "Ongoing",
            url: "https://www.labnol.org/",
            status: "approved"
        },
        {
            id: "default2",
            title: "Analytics India Magazine",
            author: "Bhasker Gupta & Team",
            image: "https://images.unsplash.com/photo-1551288049-b1f3c6fded6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
            content: "Analytics India Magazine, founded by Bhasker Gupta, provides in-depth articles, tutorials, and news on AI, machine learning, and data science. It covers neural networks, NLP, and AI applications, making it a key resource for Indian data scientists.",
            date: "Ongoing",
            url: "https://analyticsindiamag.com/",
            status: "approved"
        },
        {
            id: "default3",
            title: "IndianAI.in",
            author: "Sarvam AI Team",
            image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
            content: "IndianAI.in, by Sarvam AI, offers insights into India's AI ecosystem, focusing on generative AI, NLP, and AI for social good. It highlights indigenous AI models and innovations from Bengaluru's tech hub.",
            date: "Ongoing",
            url: "https://indianai.in/",
            status: "approved"
        },
        {
            id: "default4",
            title: "Adit Deshpande's Blog",
            author: "Adit Deshpande",
            image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
            content: "Adit Deshpande's blog simplifies machine learning and deep learning for beginners. With Indian roots, Adit covers neural networks, computer vision, and more, making complex ML concepts accessible and engaging.",
            date: "Ongoing",
            url: "https://adeshpande3.github.io/",
            status: "approved"
        },
        {
            id: "default5",
            title: "YourStory Tech Section",
            author: "Shradha Sharma & Team",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
            content: "YourStory, founded by Shradha Sharma, features tech stories and tutorials on web development, AI, and ML in its tech section. It highlights Indian startups and developers, blending practical tips with inspirational narratives.",
            date: "Ongoing",
            url: "https://yourstory.com/topic/technology",
            status: "approved"
        }
    ];

    // Load blogs from Firestore
    function loadBlogs() {
        postsGrid.innerHTML = '';

        // First add default blogs
        defaultBlogs.forEach(blog => {
            if (blog.status === 'approved') {
                createBlogCard(blog, postsGrid);
            }
        });

        // Then load from Firestore
        db.collection('blogs').where('status', '==', 'approved').get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const blog = doc.data();
                    blog.id = doc.id;
                    createBlogCard(blog, postsGrid);
                });
            })
            .catch((error) => {
                console.error("Error getting blogs: ", error);
                showToast('Error loading blogs', 'error');
            });
    }

    // Load pending blogs for admin
    function loadPendingBlogs() {
        pendingPostsGrid.innerHTML = '';

        db.collection('blogs').where('status', '==', 'pending').get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const blog = doc.data();
                    blog.id = doc.id;
                    createPendingBlogCard(blog, pendingPostsGrid);
                });

                if (querySnapshot.empty) {
                    pendingPostsGrid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1 / -1;">No pending blogs to review</p>';
                }
            })
            .catch((error) => {
                console.error("Error getting pending blogs: ", error);
                showToast('Error loading pending blogs', 'error');
            });
    }

    // Create a blog card for display
    function createBlogCard(blog, container) {
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

        // Add status badge if not approved (shouldn't happen for this function)
        if (blog.status && blog.status !== 'approved') {
            const statusBadge = document.createElement('div');
            statusBadge.className = `status-badge status-${blog.status}`;
            statusBadge.textContent = blog.status;
            blogCard.querySelector('.blog-content').appendChild(statusBadge);
        }

        container.appendChild(blogCard);

        // Animate the blog card
        setTimeout(() => {
            blogCard.style.opacity = '1';
            blogCard.style.transform = 'translateY(0)';
        }, container.children.length * 100);

        // Add click event to read more button
        blogCard.querySelector('.read-more').addEventListener('click', function (e) {
            e.preventDefault();
            openModal(blog);
        });
    }

    // Create a pending blog card for admin
    function createPendingBlogCard(blog, container) {
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

        // Add pending badge
        const statusBadge = document.createElement('div');
        statusBadge.className = 'status-badge status-pending';
        statusBadge.textContent = 'pending';
        blogCard.querySelector('.blog-content').appendChild(statusBadge);

        container.appendChild(blogCard);

        // Animate the blog card
        setTimeout(() => {
            blogCard.style.opacity = '1';
            blogCard.style.transform = 'translateY(0)';
        }, container.children.length * 100);

        // Add click event to review button
        blogCard.querySelector('.read-more').addEventListener('click', function (e) {
            e.preventDefault();
            openApprovalModal(blog);
        });
    }

    // Blog Form Submission
    blogForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const title = document.getElementById('blogTitle').value;
        const image = document.getElementById('blogImage').value || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1470&q=80";
        const content = document.getElementById('blogContent').value;
        const date = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const newBlog = {
            title,
            author: currentUser.displayName || currentUser.email,
            image,
            content,
            date,
            userId: currentUser.uid,
            status: isAdmin ? 'approved' : 'pending', // Auto-approve if admin
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Add a new blog to Firestore
        db.collection('blogs').add(newBlog)
            .then((docRef) => {
                blogForm.reset();
                blogFormContainer.classList.remove('show');
                writeBlogBtn.innerHTML = '<i class="fas fa-pen-nib"></i> Write a Blog';

                if (isAdmin) {
                    showToast('Your blog has been published successfully!');
                    loadBlogs(); // Refresh the list
                } else {
                    showToast('Your blog has been submitted for admin approval!', 'warning');
                }

                document.getElementById('blogs').scrollIntoView({ behavior: 'smooth' });
            })
            .catch((error) => {
                console.error("Error adding blog: ", error);
                showToast('Error submitting blog: ' + error.message, 'error');
            });
    });

    // Modal functions
    const modal = document.getElementById('blogModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalAuthor = document.getElementById('modalAuthor');
    const modalImage = document.getElementById('modalImage');
    const modalText = document.getElementById('modalText');
    const modalLink = document.getElementById('modalLink');

    function openModal(blog) {
        modalTitle.textContent = blog.title;
        modalAuthor.textContent = `${blog.author} • ${blog.date || new Date().toLocaleDateString()}`;
        modalImage.src = blog.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1470&q=80';
        modalImage.alt = blog.title;
        modalText.innerHTML = blog.content.replace(/\n/g, '<br><br>');

        if (blog.url) {
            modalLink.href = blog.url;
            modalLink.style.display = 'inline-flex';
        } else {
            modalLink.style.display = 'none';
        }

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModalBtn.addEventListener('click', function () {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Approval Modal functions
    const approvalImage = document.getElementById('approvalImage');
    const approvalAuthor = document.getElementById('approvalAuthor');
    const approvalText = document.getElementById('approvalText');

    function openApprovalModal(blog) {
        currentBlogId = blog.id;
        modalTitle.textContent = blog.title;
        approvalAuthor.textContent = `${blog.author} • ${blog.date || new Date().toLocaleDateString()}`;
        approvalImage.src = blog.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1470&q=80';
        approvalImage.alt = blog.title;
        approvalText.innerHTML = blog.content.replace(/\n/g, '<br><br>');

        approvalModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeApprovalModal.addEventListener('click', function () {
        approvalModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentBlogId = null;
    });

    // Approve Blog
    approveBlogBtn.addEventListener('click', function () {
        if (currentBlogId) {
            db.collection('blogs').doc(currentBlogId).update({
                status: 'approved',
                approvedAt: firebase.firestore.FieldValue.serverTimestamp()
            })
                .then(() => {
                    showToast('Blog approved successfully!');
                    approvalModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    currentBlogId = null;
                    loadPendingBlogs();
                    loadBlogs();
                })
                .catch((error) => {
                    showToast('Error approving blog: ' + error.message, 'error');
                });
        }
    });

    // Reject Blog
    rejectBlogBtn.addEventListener('click', function () {
        if (currentBlogId) {
            db.collection('blogs').doc(currentBlogId).update({
                status: 'rejected',
                rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
            })
                .then(() => {
                    showToast('Blog rejected successfully!');
                    approvalModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    currentBlogId = null;
                    loadPendingBlogs();
                })
                .catch((error) => {
                    showToast('Error rejecting blog: ' + error.message, 'error');
                });
        }
    });

    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        if (e.target === approvalModal) {
            approvalModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            currentBlogId = null;
        }
    });

    // Admin link click handler
    adminLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (adminSection.style.display === 'none') {
            adminSection.style.display = 'block';
            adminSection.scrollIntoView({ behavior: 'smooth' });
            loadPendingBlogs();
        } else {
            adminSection.style.display = 'none';
        }
    });

    const scrollToTopBtn = document.getElementById('scrollToTop');

    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId !== '#' && targetId !== '#create' && targetId !== '#admin') {
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            } else if (targetId === '#create' && !isLoggedIn) {
                loginModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            } else if (targetId === '#create' && isLoggedIn) {
                blogFormContainer.classList.add('show');
                document.getElementById('blogTitle').focus();
                document.getElementById('create').scrollIntoView({ behavior: 'smooth' });
                writeBlogBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
            } else if (targetId === '#admin' && isAdmin) {
                adminSection.style.display = 'block';
                adminSection.scrollIntoView({ behavior: 'smooth' });
                loadPendingBlogs();
            }
        });
    });

    const animateOnScroll = function () {
        const elements = document.querySelectorAll('.blog-form-container.show, .blog-card, .write-blog-btn');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    document.querySelectorAll('.blog-form-container, .blog-card, .write-blog-btn').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    window.addEventListener('scroll', animateOnScroll);
    window.addEventListener('load', function () {
        loadBlogs();
        animateOnScroll();

        // Animate hero elements
        const heroElements = document.querySelectorAll('.hero h1, .hero p, .hero-buttons');
        heroElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 200);
        });
    });
});
