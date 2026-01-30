<template>
  <div class="mainnav">
    <!-- HEADER + TOGGLE -->
    <div class="floatleft">
      <div class="header-left">
        <i class="fas fa-bars toggle-btn" @click="toggleSidebar"></i>
        <span class="header-title" @click="validateLogin('/dashboard')">CLASInfo PRO</span>
      </div>

      <!-- LEFT SIDEBAR -->
      <div
        :class="['left-sidebar', { open: sidebarOpen }]"
        @click.self="closeSidebar"
      >
        <div class="sidebar-inner">
          <span class="sidebar-title">What would you like to do?</span>
          <hr />
          <a href="javascript:void(0)" @click="validateLogin('/dashboard')" class="leftnav_btn">
            <i class="fas fa-tachometer-alt"></i>&nbsp;&nbsp;Access Dashboard
          </a>
          <a href="javascript:void(0)" @click="validateLogin('/placeorder')" class="leftnav_btn">
            <i class="fas fa-clipboard-list"></i>&nbsp;&nbsp;Place an Order
          </a>
          <a href="javascript:void(0)" @click="validateLogin('/cipinfobox')" class="leftnav_btn">
            <i class="fas fa-inbox"></i>&nbsp;&nbsp;Access your CLAS Infobox
          </a>
          <a href="javascript:void(0)" @click="validateLogin(firsturl)" class="leftnav_btn">
            <i class="fas fa-search"></i>&nbsp;&nbsp;Perform a UCC Search
          </a>
          <a href="javascript:void(0)" @click="validateLogin(secondurl)" class="leftnav_btn">
            <i class="far fa-file-alt"></i>&nbsp;&nbsp;Access UCCeZFILE® PRO
          </a>
          <a href="javascript:void(0)" @click="validateLogin(thirdurl)" class="leftnav_btn">
            <i class="fas fa-tasks"></i>&nbsp;&nbsp;Access EntityTrak
          </a>
          <a href="javascript:void(0)"
             @click="validateLogin('https://clasinfopro.clasinfo.com/paymentcenter')"
             class="leftnav_btn">
            <i class="far fa-credit-card"></i>&nbsp;&nbsp;Pay an Invoice
          </a>
          <a href="javascript:void(0)" @click="validateLogin('/contact')" class="leftnav_btn">
            <i class="far fa-comment-alt"></i>&nbsp;&nbsp;Contact Us
          </a>

          <div class="mainPageContact">
            <div class="contactInfo">
              <label>
                Contact us for assistance<br>
                (800) 952-5696<br>
                <a href="mailto:connect@clasinfo.com" style="color:#0d6efd;text-decoration:none;">connect@clasinfo.com</a>
              </label>
            </div>
            <img src="../assets/images/CLASWW.png" class="logoImage" />
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT PROFILE MENU -->
    <div class="floatright">
      <b-nav>
        <b-nav-item-dropdown right class="profilemenu" v-if="checkLogin()">
          <template #button-content>
            {{ username }}
          </template>
          <b-dropdown-item>
            <div class="profilesec">
              <div class="profiledetail">
                <span class="name">{{ fullname }}</span>
                <span>{{ emailAddress }}</span>
                <span>{{ phone }}</span>
              </div>
            </div>
          </b-dropdown-item>

          <b-dropdown-item href="/cipinfobox">
            <div class="settingOption"><i class="fas fa-inbox"></i>&nbsp;&nbsp;My Orders</div>
          </b-dropdown-item>

          <b-dropdown-item href="/Userprofile">
            <div class="settingOption"><i class="far fa-user-circle"></i>&nbsp;&nbsp;My Profile</div>
          </b-dropdown-item>

          <b-dropdown-item @click="signOut">
            <div class="settingOption"><i class="fas fa-sign-out-alt"></i>&nbsp;&nbsp;Sign Out</div>
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-nav>
    </div>

    <div class="clear"></div>

    <!-- FOOTER -->
    <footer id="page-footer">
      <div class="nav">
        <small class="nav-item"><a href="/contact" class="nav-link text-info">Contact us</a></small>
        <small class="nav-item"><a href="/terms" class="nav-link text-info">Terms of use</a></small>
        <small class="nav-item"><a href="/privacypolicy" class="nav-link text-info">Privacy policy</a></small>
      </div>
      <small class="copy">
        Copyright © 2022 <a href="https://clasinfo.com" target="_blank">CLAS Information Services</a>. All rights reserved.
      </small>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sidebarOpen: false,
      username: localStorage.getItem("username"),
      fullname: localStorage.getItem("fullname"),
      emailAddress: localStorage.getItem("emailAddress"),
      phone: localStorage.getItem("phone"),
      firsturl: '',
      secondurl: '',
      thirdurl: ''
    };
  },
  mounted() {
    const websitelinkid = localStorage.getItem('websitelinkid');
    const bookkeepingid = localStorage.getItem('bookkeepingid');
    this.firsturl  = `http://searching.clasinfo.com/passthru?vtech=${websitelinkid}&vtget=${bookkeepingid}`;
    this.secondurl = `http://www.uccezfile.com/passthru?vtech=${websitelinkid}&vtget=${bookkeepingid}`;
    this.thirdurl  = `http://entitytrak.clasinfo.com/passthru?vtech=${websitelinkid}&vtget=${bookkeepingid}`;

    // Close sidebar when click outside
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    closeSidebar() {
      this.sidebarOpen = false;
    },
    handleClickOutside(e) {
      const sidebar = this.$el.querySelector('.left-sidebar');
      const toggleBtn = this.$el.querySelector('.toggle-btn');
      if (sidebar && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        this.sidebarOpen = false;
      }
    },
    checkLogin() {
      return !!localStorage.getItem('token');
    },
    validateLogin(url) {
      if (this.checkLogin()) {
        url === '/dashboard'
          ? location.replace(url)
          : window.open(url, '_blank');
      } else {
        location.replace('/');
      }
    },
    signOut() {
      [
        'token','username','fullname','emailAddress','phone',
        'userid','websitelinkid','bookkeepingid','securityalert'
      ].forEach(k => localStorage.removeItem(k));
      location.replace('/');
    }
  }
};
</script>

<style scoped>
/* LEFT SIDEBAR */
.left-sidebar {
  position: fixed;
  top: 52px; /* blue line height */
  left: 0;
  width: 0;
  height: 100%;
  background: #f7f7f7;
  overflow-x: hidden;
  transition: width 0.3s ease;
  z-index: 999;
  box-shadow: 2px 0 5px rgba(0,0,0,0.2);
}
.left-sidebar.open {
  width: 300px;
}
.sidebar-inner {
  padding: 15px;
}

/* HEADER */
/* .header-left {
  display: flex;
  align-items: center;
  height: 50px;
  border-bottom: 3px solid #003e77;
  padding: 0 15px;
} */
 .header-left {
    display: flex;
    align-items: center;
    height: 51px;
    background-color: #003e77;
    padding: 0 15px;
    color: #fff;
    width: 300px;;
}

.header-title {
  color: #fff;
  /* font-weight: bold; */
  font-size: 18px;
  margin-left: 10px;
  cursor: pointer;
}

/* TOGGLE BUTTON */
.toggle-btn {
  cursor: pointer;
  font-size: 20px;
  color: #fff;
}

/* LEFT NAV BUTTONS */
.leftnav_btn {
  display: block;
  padding: 8px 10px;
  color: #003e77;
  text-decoration: none;
  margin-bottom: 5px;
  font-weight: 500;
}
.leftnav_btn:hover {
  background: #e2e8f0;
}

/* Footer and profile - keep old styles */
</style>
