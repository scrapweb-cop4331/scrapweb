
const login = async () => {
    console.log("login: start")
    let jwt = "";
    const loginBody =  {
        username: process.env.TEST_USER,
        password: process.env.TEST_PASSWORD,
      };
  try {
    const res = await fetch(process.env.TEST_URL + "login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginBody)
    });
    if (!res.ok) {
      console.error("login: http status is " + res.status);
    }
    else {
        const data = await res.json();

        console.log(`login: pass`);
        jwt = data.token;
    }
  } catch (err) {
    console.error("login: " + err);
  }

  console.log("login: " + jwt);
  console.log(`login: Done`);
  return jwt;
};


async function register() {
    console.log("register: start")
    try {
        const response = await fetch(process.env.TEST_URL + "register", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: "test",
                last_name: "test",
                username: process.env.TEST_USER,
                email: process.env.TEST_EMAIL,
                password: process.env.TEST_PASSWORD
            })
        })
        
        const data = await response.json()
        
        if (response.status == 409) {

            if ((data.error) == "Username or email already exists")
              console.log("register: pass")
        }        
        
    } catch (err) {
        console.log('register: Could not connect to server')
    }
    console.log("register: done");
}

const jwtPromise = login();
register();