# SHAREing project site

The SHAREing project site is a static site, generated from Markdown source by Jekyll (an application in Ruby) and hosted on GitHub Pages. It is available at https://SHAREing-DRI.github.io.

## Table of Contents

- [SHAREing project site](#shareing-project-site)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Build](#build)
    - [Running Locally](#running-locally)
  - [Ruby \& Bundler Notes](#ruby--bundler-notes)
    - [Why Bundler?](#why-bundler)
    - [Installing Ruby with RVM](#installing-ruby-with-rvm)
  - [Contributing](#contributing)


## Getting Started

### Prerequisites

The following instructions assume a *nix-type environment.

To build and run the site locally, you need:

- Git
- Ruby
- Bundler
- Jekyll

> Note: Ruby is not always up-to-date on macOS or Linux distributions. See Ruby & Bundler Notes for help installing the latest version. 

### Build

To build the site locally (e.g. for testing your changes prior to contributing) please follow the instructions below. For more details, see the GitHub Pages documentation:  
https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll

1. Clone the repository:

   ```bash
   git clone https://github.com/SHAREing-DRI/SHAREing-DRI.github.io
   cd SHAREing-DRI.github.io
   ```

2. Install Ruby dependencies:

   ```bash
   bundle install
   ```

If you do not have Ruby (and likely therefore Bundler) installed, please see [Ruby \& Bundler Notes](#ruby--bundler-notes) below.

### Running Locally
To serve the site locally:

```bash
bundle exec jekyll serve
```

Then open your browser and go to `http://localhost:4000`.

---

## Ruby & Bundler Notes

### Why Bundler?

Bundler manages Ruby "gem" dependencies, ensuring consistent environments across machines.

### Installing Ruby with RVM

If your system Ruby is outdated (as it is likely to be) you can install the latest version, with the help of Ruby Version Manager (RVM). RVM is a command-line tool which allows you to easily install, manage, and work with multiple ruby environments from interpreters to sets of gems. Here it is used to manage interpreters.

One way to install RVM is as follows; other methods are described [on the RVM website](https://rvm.io/).

```bash
\curl -sSL https://get.rvm.io | bash -s stable
source ~/.rvm/scripts/rvm
rvm install ruby
rvm use ruby --default
```

Then install Bundler:

```bash
gem install bundler
```

---

## Contributing

We welcome contributions! Here's one way to get started.

1. Fork the repository on GitHub.
2. Clone your fork locally:

   ```bash
   git clone https://github.com/your-username/your-fork.git
   cd your-fork
   ```

3. Create a new branch for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. Make your changes and commit them:

   ```bash
   git add .
   git commit -m "Add your message here"
   ```

5. Push to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

6. Through the GitHub web UI, open a Pull Request against the `main` branch of the original repository.

