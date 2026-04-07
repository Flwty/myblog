# 👾 像素风博客：从零开始的终极操作指南

你好！欢迎来到你的专属像素风博客。这份指南是为你量身定制的，**完全不需要你有任何编程基础**。

我会用最通俗易懂的语言，手把手教你如何管理、修改和扩展这个网站。只要你跟着步骤一步步来，你就能完全掌控你的数字花园！

---

## 📁 第一部分：认识你的网站文件

在左侧的文件浏览器中，有很多文件和文件夹。但作为网站的主人，你**只需要关心以下几个文件**：

1. **`src/App.tsx`**：这是你网站的**核心心脏**！你网站上的所有文字、文章数据、页面排版、导航栏，全都在这个文件里。**你 90% 的修改都会在这里进行。**
2. **`src/index.css`**：这是网站的**衣服**（样式表）。网站的背景颜色、像素风的边框、字体的粗细，都是在这里定义的。
3. **`vite.config.ts`**：这是网站的**打包设置**。当你需要把网站发布到 GitHub Pages 时，你需要修改这里面的 `base` 路径。

---

## 📝 第二部分：如何修改个人信息？

打开 `src/App.tsx` 文件，你可以修改主页上的个人信息。

### 1. 修改打字机（Terminal）里的文字
在代码的大约第 `400` 行左右，你会看到这样一段代码：
```javascript
const Home = () => {
  const fullText = "Hello, traveler. Welcome to my digital garden.\n\nI document life, design, and the quiet moments in between. Stay a while and listen.";
// ...
```
**怎么改？**
直接把引号 `""` 里面的英文换成你想说的话。
*提示：如果你想换行，请在文字中间加上 `\n\n`（两个反斜杠加n），这代表回车换行。*

### 2. 修改左侧 Info 栏的头像、名字和简介
在代码的大约第 `480` 行左右（在 `<!-- Sidebar / Info -->` 下面），你会看到：
```javascript
// 修改头像：把 src 里面的网址换成你自己的图片网址
<img src="https://picsum.photos/seed/avatar/200/200" alt="Avatar" ... />

// 修改名字：把 Akihiro 换成你的名字
<MagneticText text="Akihiro" />

// 修改简介：直接修改这里的文字
<p className="text-sm font-bold text-slate-500 mb-6">
  Digital Nomad & Developer. I love building things and sharing my journey with the world.
</p>
```

### 3. 修改社交链接（GitHub, Twitter, Instagram）
紧接着简介的下方，你会看到按钮的代码：
```javascript
<a href="#" className="pixel-btn px-3 py-1 text-xs">GitHub</a>
<a href="#" className="pixel-btn px-3 py-1 text-xs">Twitter</a>
<a href="#" className="pixel-btn px-3 py-1 text-xs">Instagram</a>
```
**怎么改？**
把 `href="#"` 里面的 `#` 换成你真实的个人主页链接。
例如：`<a href="https://twitter.com/你的ID" className="...">Twitter</a>`

---

## 📚 第三部分：如何发布和管理博客文章？

你的所有文章并没有存在复杂的数据库里，而是直接写在了代码里，这叫“静态博客”，非常快且安全！

### 1. 找到文章仓库
打开 `src/App.tsx`，在文件最顶部（大约第 14 行），你会看到一个叫 `POSTS` 的列表：
```javascript
const POSTS = [
  {
    id: 1,
    title: "A Quiet Morning in Kyoto",
    // ...
```

### 2. 添加新文章
在 `POSTS` 列表的最前面（或者最后面），复制并粘贴以下模板，然后填入你的内容：

```javascript
  {
    id: 6, // ⚠️ 极度重要：这个数字必须是唯一的！如果上一篇是 5，这篇就是 6。
    title: "你的新文章标题",
    excerpt: "这是一段简短的摘要，会显示在主页和列表页。",
    content: "这里是文章的正文内容。\n\n如果你想分段，请使用两个斜杠加n，就像这样：\n\n这是新的一段。",
    date: "2026-04-10", // 文章发布的日期
    image: "https://picsum.photos/seed/anyword/800/600", // 文章封面的图片链接
    category: "Life" // 文章的分类，比如 Tech, Life, Art
  }, // ⚠️ 注意：除了最后一篇文章，每篇文章的大括号 } 后面都要加一个英文逗号 ,
```
只要你保存了文件，新文章就会自动出现在主页的 "Recent Items" 和 "Journal" 列表里！

---

## 🧭 第四部分：如何扩展导航栏？

如果你想在顶部导航栏加一个新页面（比如“关于我” `About`）。

### 1. 修改电脑端菜单
在 `src/App.tsx` 搜索 `{/* 桌面端菜单 */}`。在现有的 `<Link>` 标签下面加上：
```javascript
<Link to="/about" className="pixel-btn text-sm">
  <MagneticText text="[ About ]" />
</Link>
```

### 2. 修改手机端菜单
在 `src/App.tsx` 搜索 `{/* 移动端菜单遮罩层 */}`。在现有的 `<Link>` 标签下面加上：
```javascript
<Link to="/about" className="pixel-btn w-full text-center" onClick={() => setMobileMenuOpen(false)}>
  <MagneticText text="About" />
</Link>
```
*(注：如果你加了新链接，还需要写新页面的代码。如果你不会写，随时在聊天框里告诉我：“帮我写一个 About 页面”，我会直接帮你写好！)*

---

## 🚀 第五部分：如何将网站免费部署到 GitHub Pages？

想让全世界都能访问你的博客？跟着做：

### 1. 导出代码到 GitHub
在当前 AI Studio 界面的右上角，点击 **Export to GitHub**。
连接你的账号，创建一个新仓库，比如叫 `myblog`。

### 2. 修改 Vite 配置 (非常重要)
在 GitHub 上打开你的 `myblog` 仓库，找到 `vite.config.ts` 文件，点击铅笔图标编辑。
把 `base` 后面的名字改成你的仓库名：
```typescript
export default defineConfig(({mode}) => {
  return {
    base: '/myblog/', // ⚠️ 这里必须和你的仓库名字一模一样，前后都要有斜杠！
    plugins: [react(), tailwindcss()],
    // ...
```
点击 **Commit changes** 保存。

### 3. 自动部署
我已经为你写好了自动化部署脚本（在 `.github/workflows/deploy.yml` 里）。
所以你修改完 `vite.config.ts` 后，GitHub 会**全自动**帮你把网站发布出去！
你只需要去仓库顶部的 **Settings -> Pages** 里面，就能看到你的专属网站链接了。

---

## 💬 第六部分：如何配置 Gitalk 评论功能？

Gitalk 是一个基于 GitHub 的评论插件。为了让它工作，你需要去 GitHub 申请一个“通行证”。

1. 登录 [GitHub](https://github.com/)。
2. 点击右上角头像 -> **Settings**。
3. 左侧菜单滑到最底部，点击 **Developer settings**。
4. 点击 **OAuth Apps** -> **New OAuth App**。
5. 填写信息：
   - **Application name**: 你的博客名字
   - **Homepage URL**: 你的 GitHub Pages 网站链接（比如 `https://你的名字.github.io/myblog/`）
   - **Authorization callback URL**: 填和 Homepage URL 一模一样的链接。
6. 点击 **Register application**。
7. 注册成功后，你会得到一个 **Client ID**。
8. 点击 **Generate a new client secret**，生成一个 **Client Secret**。

**把 `Client ID` 和 `Client Secret` 发给我，我就会帮你把评论区加到文章底部！**
