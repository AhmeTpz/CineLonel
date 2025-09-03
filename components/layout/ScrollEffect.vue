# ===================================================
# SCROLL EFFECT / KAYDIRMA ETKİSİ
# ===================================================

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// GLOBAL SCROLL EFFECT FOR ALL PAGES / TÜM SAYFALAR İÇİN GLOBAL KAYDIRMA ETKİSİ
let scrollY = 0
let isScrolling = false
let hasTriggered = false // TRACK IF EFFECT HAS BEEN TRIGGERED / ETKİNİN TETİKLENİP TETİKLENMEDİĞİNİ TAKİP ET

// SCROLL TO CONTENT SECTION WITH PROPER OFFSET / UYGUN OFSET İLE İÇERİK BÖLÜMÜNE KAYDIR
const scrollToContent = () => {
  const contentSection = document.querySelector('.content-section')
  if (contentSection) {
    // ADD OFFSET TO ACCOUNT FOR FIXED HEADER / SABİT BAŞLIK İÇİN OFSET EKLE
    const headerHeight = 96 // pt-24 = 96px
    const elementTop = contentSection.getBoundingClientRect().top + window.pageYOffset - headerHeight

    window.scrollTo({
      top: elementTop,
      behavior: 'smooth'
    })
  }
}

// HANDLE SCROLL EVENTS WITH THRESHOLD / EŞİK İLE KAYDIRMA OLAYLARINI YÖNET
const handleGlobalScroll = () => {
  if (isScrolling) return

  const currentScrollY = window.scrollY
  const scrollThreshold = 100 // 100px scroll threshold

  // DETERMINE SCROLL DIRECTION / KAYDIRMA YÖNÜNÜ BELİRLE
  const scrollDirection = currentScrollY > scrollY ? 'down' : 'up'

  // ONLY TRIGGER IF SCROLLING DOWN AND THRESHOLD IS MET, AND HASN'T BEEN TRIGGERED YET / SADECE AŞAĞI KAYDIRMA VE EŞİK KARŞILANDIĞINDA VE HENÜZ TETİKLENMEDİĞİNDE TETİKLE
  if (scrollDirection === 'down' && currentScrollY > scrollThreshold && !hasTriggered) {
    isScrolling = true
    hasTriggered = true // MARK AS TRIGGERED / TETİKLENDİ OLARAK İŞARETLE
    scrollToContent()

    // RESET AFTER ANIMATION / ANİMASYONDAN SONRA SIFIRLA
    setTimeout(() => {
      isScrolling = false
    }, 1000)
  }

  // RESET TRIGGER FLAG WHEN SCROLLING BACK TO TOP / TEKRAR YUKARI KAYDIRIRKEN TETİKLEME BAYRAĞINI SIFIRLA
  if (currentScrollY < 50) {
    hasTriggered = false
  }

  // ALWAYS UPDATE SCROLLY FOR NEXT COMPARISON / BİR SONRAKI KARŞILAŞTIRMA İÇİN SCROLLY'Yİ HER ZAMAN GÜNCELLE
  scrollY = currentScrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleGlobalScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleGlobalScroll)
})
</script>

<template>
  <div></div>
</template>
