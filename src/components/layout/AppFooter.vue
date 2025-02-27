<template>
    <footer class="footer">
      <div class="container footer-content">
        <div class="copyright">
          &copy; {{ currentYear }} Timely - Paul BRUSON - Mathieu CLAIR
        </div>
        
        <div class="footer-links">
          <a href="#" target="_blank" class="github-link" title="Voir le code source sur GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="github-icon">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  
  const currentYear = ref(new Date().getFullYear())
  </script>
  
  <style scoped>
  .footer {
    background-color: white;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
    padding: 1rem 0;
    margin-top: 2rem;
  }
  
  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .copyright {
    font-size: 0.875rem;
    color: var(--gray-600);
  }
  
  .footer-links {
    display: flex;
    gap: 1rem;
  }
  
  .github-link {
    display: flex;
    align-items: center;
    color: var(--gray-700);
    transition: color 0.2s ease;
  }
  
  .github-link:hover {
    color: var(--primary-color);
  }
  
  .github-icon {
    display: block;
  }
  
  /* Responsive */
  @media (max-width: 640px) {
    .footer-content {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }
  </style>