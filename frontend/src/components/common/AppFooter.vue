<template>
  <footer class="page-footer">
    <div class="footer-nav">
      <small>
        <RouterLink to="/contact" class="footer-link">
          Contact <span class="hide-sm">us</span>
        </RouterLink>
      </small>

      <small>
        <RouterLink to="/terms" class="footer-link">
          Terms <span class="hide-sm">of use</span>
        </RouterLink>
      </small>

      <small>
        <RouterLink to="/privacypolicy" class="footer-link">
          Privacy <span class="hide-sm">policy</span>
        </RouterLink>
      </small>
    </div>

    <small class="copy">
      © 2026
      <a href="https://clasinfo.com" target="_blank" class="brand">
        CLAS Information Services
      </a>.
      All rights reserved.
    </small>
  </footer>
</template>
<style scoped>
.page-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  font-size: 13px;
  background: #f8f9fa;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.footer-nav {
  display: flex;
  gap: 16px;
}

.footer-link {
  color: #0d6efd;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

.copy {
  color: #555;
}

.brand {
  color: #0d6efd;
  text-decoration: none;
}

/* responsive behavior like old footer */
@media (max-width: 576px) {
  .hide-sm {
    display: none;
  }

  .page-footer {
    flex-direction: column-reverse;
    gap: 8px;
    text-align: center;
  }
}
</style>
