import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// setting middleware configration
app.use(express.json({ limit: "16kb" })); // this is when we got data from form

// now when we have to get data from url
// coz when we search on google (hemant kumar yadav) -> (https://www.google.com/search?q=hemant+kumar+yadav&sca_esv=9ac459bdbc3a9ac1&sxsrf=ADLYWILI3v2H4fn-1Z3xlb99NKT5x_eHug%3A1732080032619&source=hp&ei=oHE9Z52hI4af4-EP2J-v-Ag&iflsig=AL9hbdgAAAAAZz1_sK79Y4yYmVs2O49ttIFSOjpB1-Gh&ved=0ahUKEwid8cH4lOqJAxWGzzgGHdjPC48Q4dUDCBg&uact=5&oq=hemant+kumar+yadav&gs_lp=Egdnd3Mtd2l6IhJoZW1hbnQga3VtYXIgeWFkYXYyCBAAGIAEGMsBMggQABiABBjLATIGEAAYFhgeMgYQABgWGB4yBhAAGBYYHjIIEAAYgAQYogRIqUlQAFjGQnAEeACQAQCYAdsBoAGMGaoBBjAuMTkuMbgBA8gBAPgBAZgCGKAC_BnCAgQQIxgnwgIKECMYgAQYJxiKBcICEBAuGIAEGNEDGMcBGCcYigXCAhYQLhiABBixAxjRAxhDGIMBGMcBGIoFwgIQEC4YgAQY0QMYQxjHARiKBcICCxAAGIAEGLEDGIMBwgIIEAAYgAQYsQPCAgsQLhiABBixAxiDAcICDhAuGIAEGLEDGNEDGMcBwgIFEAAYgATCAggQLhiABBixA8ICChAAGIAEGEMYigXCAg0QABiABBixAxhDGIoFwgIREC4YgAQYsQMY0QMYxwEYigXCAg4QABiABBixAxiDARiKBcICBRAuGIAEwgINEC4YgAQYsQMYQxiKBcICBBAAGAPCAgoQLhiABBgCGMsBwgILEC4YgAQYsQMY1ALCAgUQIRigAcICDRAuGIAEGLEDGNQCGA3CAgcQABiABBgNwgIHEC4YgAQYDcICDRAuGIAEGMcBGA0YrwHCAgsQLhiABBjHARivAZgDAJIHBjQuMTkuMaAH5O0B&sclient=gws-wiz)
// url become this long and we have to get data from this url so we have to use express encoder

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public/temp")); // to store image files, favicons

app.use(cookieParser()); // read/remove the server cookies

// routes
import userRouter from "./routes/user.routes.js";

// routes decleartion
app.use("/api/v1/users", userRouter);

export { app };
