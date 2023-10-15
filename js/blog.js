const blogApp = {
  blogList: [],
  currentPage: 0,
  itemsPerPage: 50,

  fetchBlogList: async function () {
    try {
      const response = await fetch(
        'https://server.cirrocloudug.com/api/v1/blogs'
      );
      if (response.ok) {
        const data = await response.json();
        this.blogList.push(...data.blogs);
        this.renderBlogList();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching blog list:', error);
    }
  },

  createBlogOnAPI: async function (blog) {
    try {
      const response = await fetch(
        'https://server.cirrocloudug.com/api/v1/blogs',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(blog),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdBlog = await response.json();
      return createdBlog;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  createBlogListItem: function (blog) {
    const blogItem = document.createElement('li');
    blogItem.classList.add('menu-item');

    const id = document.createElement('h6');
    id.textContent = blog._id;
    id.style.display = 'none';

    const img = document.createElement('img');
    img.classList.add('img');
    img.src = blog.imageUrl;

    const info = document.createElement('div');
    info.classList.add('item-info');

    const header = document.createElement('h4');
    header.textContent = blog.title;

    const underline = document.createElement('div');
    underline.classList.add('underline');

    const hiddenContent = document.createElement('h5');

    const articleText = blog.content || '';
    hiddenContent.textContent = articleText;
    hiddenContent.style.display = 'none';

    const words = articleText.split(' ').slice(0, 20).join(' ');
    const ellipsis = '...';
    const readMoreLink =
      'Read More <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M284.9 412.6l138.1-134c6-5.8 9-13.7 9-22.4v-.4c0-8.7-3-16.6-9-22.4l-138.1-134c-12-12.5-31.3-12.5-43.2 0-11.9 12.5-11.9 32.7 0 45.2l83 79.4h-214c-17 0-30.7 14.3-30.7 32 0 18 13.7 32 30.6 32h214l-83 79.4c-11.9 12.5-11.9 32.7 0 45.2 12 12.5 31.3 12.5 43.3 0z"></path></svg>';

    const content = document.createElement('p');
    content.textContent = words + ellipsis;

    const readMoreButton = document.createElement('a');
    readMoreButton.setAttribute('id', 'read-more');
    readMoreButton.innerHTML = readMoreLink;

    const blogFooter = document.createElement('footer');
    const blogFooterSpanOne = document.createElement('span');
    blogFooterSpanOne.classList.add('date');
    const dateSvg =
      '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" class="icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8L334.6 349c-3.9 5.3-11.4 6.5-16.8 2.6z"></path></svg>';
    const formattedTime = this.formatDateToString(blog.date);
    blogFooterSpanOne.innerHTML = dateSvg + formattedTime;
    const blogFooterSpanTwo = document.createElement('span');

    blogFooterSpanTwo.innerHTML = `${blog.readTime}<!-- --> min read`;
    blogFooter.appendChild(blogFooterSpanOne);
    blogFooter.appendChild(blogFooterSpanTwo);

    content.appendChild(readMoreButton);

    info.appendChild(header);
    info.appendChild(underline);
    info.appendChild(content);

    const blogDetails = document.createElement('div');
    blogDetails.classList.add('blog-details');

    const dateAndReadTime = document.createElement('small');
    dateAndReadTime.textContent = `${blog.date} - ${blog.readTime} min read`;

    blogItem.appendChild(id);
    blogItem.appendChild(hiddenContent);
    blogItem.appendChild(img);
    blogItem.appendChild(info);
    blogItem.appendChild(blogFooter);

    return blogItem;
  },

  renderBlogList: function () {
    const blogListElement = document.querySelector('.blog-list');
    blogListElement.innerHTML = '';
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    for (let i = startIndex; i < endIndex && i < this.blogList.length; i++) {
      const blogItem = this.createBlogListItem(this.blogList[i]);
      blogListElement.appendChild(blogItem);
    }

    this.addClickEventListenersToBlogItems();
    this.updatePaginationButtons();
  },

  addClickEventListenersToBlogItems: function () {
    const blogItems = document.querySelectorAll('.menu-item');

    blogItems.forEach((item) => {
      item.addEventListener('click', () => {
        localStorage.removeItem('selectedBlog');

        let blogData = this.blogList.find(
          (blog) => blog._id === item.querySelector('h6').innerText
        );
        console.log(blogData);
        console.log(this.blogList);
        const datePattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
        const dateMatch = blogData.date.match(datePattern);
        const date = dateMatch ? dateMatch[0] : null;

        blogData.date = date;

        localStorage.setItem('selectedBlog', JSON.stringify(blogData));
        window.location.href = 'blog-details.html';
      });
    });
  },

  displayBlogDetail: function () {
    const selectedBlog = JSON.parse(localStorage.getItem('selectedBlog'));

    if (selectedBlog) {
      const blogDetailTitle = document.querySelector('.blog-detail-title');
      const blogDetailDate = document.querySelector('.blog-detail-date');
      const blogDetailReadTime = document.querySelector(
        '.blog-detail-readTime'
      );
      const blogDetailContent = document.querySelector('.blog-detail-content');
      const blogDetailImage = document.querySelector('.blog-detail-image');

      const renderedContent = marked.parse(selectedBlog.content || '');

      const formattedTime = this.formatDateToString(selectedBlog.date);

      blogDetailTitle.innerText = selectedBlog.title;
      blogDetailDate.innerText = formattedTime;
      blogDetailContent.innerHTML = renderedContent;
      blogDetailImage.setAttribute('src', selectedBlog.imageUrl);
    }

    const editButton = document.querySelector('.edit-btn');
    if (editButton) {
      editButton.addEventListener('click', () => {
        const blogData = JSON.parse(localStorage.getItem('selectedBlog'));
        localStorage.setItem('selectedBlog', JSON.stringify(blogData));
        window.location.href = 'blog-form.html';
      });
    }
  },

  loadBlogForm: function () {
    const existingBlogData = JSON.parse(localStorage.getItem('selectedBlog'));
    // Get the form header and submit button elements
    const formHeader = document.getElementById('form-header');
    const submitButton = document.getElementById('submit-button');
    if (existingBlogData) {
      // Set the form header and submit button text for editing a blog
      formHeader.textContent = 'Edit Blog';
      submitButton.textContent = 'Update Blog';
      this.populateForm(existingBlogData);
    } else {
      // Set the form header and submit button text for creating a new blog
      formHeader.textContent = 'Create Blog';
      submitButton.textContent = 'Save Blog';
    }
  },

  saveBlog: async function () {
    const idInput = document.getElementById('blog-id');
    const titleInput = document.getElementById('blog-title');
    const dateInput = document.getElementById('blog-date');
    const readTimeInput = document.getElementById('blog-readTime');
    const imageUrlInput = document.getElementById('blog-imageUrl');
    const contentInput = document.getElementById('blog-content');

    const blogData = {
      title: titleInput.value,
      date: dateInput.value,
      readTime: parseInt(readTimeInput.value, 10),
      imageUrl: imageUrlInput.value,
      content: contentInput.value,
    };

    const existingBlogData = JSON.parse(localStorage.getItem('selectedBlog'));

    if (existingBlogData) {
      // Update an existing blog
      const blogId = existingBlogData._id;
      await this.updateBlog(blogId, blogData);
    } else {
      // Create a new blog
      await this.createBlogOnAPI(blogData);
    }

    window.location.href = 'blog.html';
  },

  populateForm: function (blogData) {
    const titleInput = document.querySelector('#blog-title');
    const dateInput = document.querySelector('#blog-date');
    const readTimeInput = document.querySelector('#blog-readTime');
    const imageInput = document.querySelector('#blog-imageUrl');
    const contentInput = document.querySelector('#blog-content');

    const datetimeString = blogData.date;

    const formatDate = (date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();

      return `${year}-${month}-${day}`;
    };

    const dateObject = new Date(datetimeString);
    const formattedDate = formatDate(dateObject);

    titleInput.value = blogData.title || '';
    dateInput.value = formattedDate || '';
    readTimeInput.value = blogData.readTime || '';
    imageInput.value = blogData.imageUrl || '';
    contentInput.value = blogData.content || '';
  },

  updateBlog: async function (blogId, updatedData) {
    try {
      const response = await fetch(
        `https://server.cirrocloudug.com/api/v1/blogs/${blogId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Blog updated successfully:', responseData);
    } catch (error) {
      console.error('Error updating blog:', error);
    }
    window.location.href = 'blog.html';
  },

  initCreateBlogButton: function () {
    if (document.querySelector('.create-blog-btn')) {
      document
        .querySelector('.create-blog-btn')
        .addEventListener('click', () => {
          localStorage.removeItem('selectedBlog');
          window.location.href = 'blog-form.html';
        });
    }
  },

  formatDateToString: function (dateString) {
    const date = new Date(dateString);
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    const ordinal = (day) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    return `${monthNames[monthIndex]}, ${day}${ordinal(day)} ${year}`;
  },

  formatStringToDate: function (formattedString) {
    const regex = /^(\w+),\s+(\d+)(?:\w+)\s+(\d+)$/i;
    const matches = regex.exec(formattedString);

    if (!matches) {
      throw new Error('Invalid formatted date string');
    }

    const monthNames = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };

    const year = parseInt(matches[3], 10);
    const month = monthNames[matches[1]];
    const day = parseInt(matches[2], 10);

    const date = new Date(year, month, day);
    return date.toISOString();
  },

  FaqClickEvents: function () {
    window.addEventListener('DOMContentLoaded', (event) => {
      const questions = document.querySelectorAll('.question');
      const buttons = document.querySelectorAll('.question-btn');

      questions.forEach((question, index) => {
        const paragraph = question.querySelector('p');
        if (index === 0) {
          question.querySelector('.question-btn').classList.add('hide-btn');
        } else {
          paragraph.classList.add('hidden');
        }
      });
      buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
          questions.forEach((question, innerIndex) => {
            const paragraph = question.querySelector('p');
            if (index === innerIndex) {
              paragraph.classList.remove('hidden');
              button.classList.add('hide-btn');
            } else {
              paragraph.classList.add('hidden');
              question
                .querySelector('.question-btn')
                .classList.remove('hide-btn');
            }
          });
        });
      });
    });
  },

  addClickEventListenersToColumnButtons: function () {
    const buttons = document.querySelectorAll('.btn-container button');
    // Add click event listeners to the buttons
    buttons.forEach((button) =>
      button.addEventListener('click', this.handleColumnButtonsClickEvents)
    );
  },

  handleColumnButtonsClickEvents: function (event) {
    const buttons = document.querySelectorAll('.btn-container button');
    const blogsContainer = document.getElementById('blogs-container');

    buttons.forEach((button) => button.classList.remove('active'));

    event.target.classList.add('active');

    if (event.target.classList.contains('null')) {
      blogsContainer.classList.add('single-column');
    } else {
      blogsContainer.classList.remove('single-column');
    }
  },
  addHoverEventsForNavDropDownLists: function (event) {
    const navLinkDropdown = document.querySelector('.nav-link[navbar-data]');
    const dropdownList = document.querySelector(
      ':scope > .nav-link-dropdown-list[navbar-data]'
    );

    function showDropdown() {
      dropdownList.style.display = 'block';
    }

    function hideDropdown() {
      dropdownList.style.display = 'none';
    }

    navLinkDropdown.addEventListener('mouseover', showDropdown);
    dropdownList.addEventListener('mouseover', showDropdown);

    navLinkDropdown.addEventListener('mouseout', hideDropdown);
    dropdownList.addEventListener('mouseout', hideDropdown);
  },
};

blogApp.initCreateBlogButton();
blogApp.FaqClickEvents();
blogApp.addClickEventListenersToColumnButtons();
blogApp.addHoverEventsForNavDropDownLists();
