    import { defineStore } from "pinia";
import { ref } from "vue";

function fakeLogin(email, password) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        uid: "123",
        email,
        displayName: email.split("@")[0],
        photoURL: null
      });
    }, 600);
  });
}

function fakeRegister(name, email, password) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        uid: "123",
        email,
        displayName: name,
        photoURL: null
      });
    }, 600);
  });
}


export const useAuthStore = defineStore("auth", () => {

  const user = ref(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const loading = ref(false);
  const error = ref(null);


  const login = async (email, password) => {
    loading.value = true;
    error.value = null;

    try {
      const loggedUser = await fakeLogin(email, password);
      user.value = loggedUser;
      localStorage.setItem("user", JSON.stringify(loggedUser));
      return true;
    } catch (err) {
      error.value = "Login failed.";
      return false;
    } finally {
      loading.value = false;
    }
  };

  const register = async (name, email, password) => {
    loading.value = true;
    error.value = null;

    try {
      const newUser = await fakeRegister(name, email, password);
      user.value = newUser;
      localStorage.setItem("user", JSON.stringify(newUser));
      return true;
    } catch (err) {
      error.value = "Registration failed.";
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    localStorage.removeItem("user");
  };

  const isLoggedIn = () => !!user.value;

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isLoggedIn
  };
});
