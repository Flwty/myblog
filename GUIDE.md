# 👾 像素风博客操作指南 (小白专属)

欢迎使用你的专属像素风博客！这份指南专为没有编程基础的新手编写，将手把手教你如何管理和扩展你的网站。

---

## 📝 1. 如何添加新的博客文章？

你的所有文章数据目前保存在 `src/App.tsx` 文件中。按照以下步骤即可添加新文章：

### 第一步：找到文章数据区
在左侧的文件浏览器中，点击打开 `src/App.tsx` 文件。
在文件的大约第 14 行，你会看到这样一段代码：
```javascript
const POSTS = [
  {
    id: 1,
    title: "A Quiet Morning in Kyoto",
    // ...
```
这个 `POSTS` 列表里面包含了你所有的文章。

### 第二步：复制并修改文章模板
在 `POSTS` 列表的最后（或者最前面），复制并粘贴以下模板，然后修改里面的内容：

```javascript
  {
    id: 6, // ⚠️ 注意：这里的 id 必须是唯一的数字，不能和其他文章重复！
    title: "你的新文章标题",
    excerpt: "这是一段简短的摘要，会显示在主页的文章列表中。",
    content: "这里是文章的正文内容。\n\n如果你想换行，请使用两个斜杠加一个n，就像这样：\n\n这是新的一段。",
    date: "2026-04-10", // 文章日期
    image: "https://picsum.photos/seed/anyword/800/600", // 文章封面图链接
    category: "分类名称" // 比如：Life, Tech, Thoughts
  }, // ⚠️ 注意：除了最后一篇文章，每篇文章的大括号 } 后面都要加一个英文逗号 ,
```

保存文件后，你的新文章就会自动出现在主页和 Journal（文章列表）页面中了！

---

## 🧭 2. 如何扩展导航栏（添加新菜单）？

如果你想在顶部导航栏添加一个新的页面链接（比如“关于我” `About`），你需要同时修改**电脑端**和**手机端**的导航菜单。

### 第一步：添加电脑端菜单
在 `src/App.tsx` 文件中，搜索（Ctrl+F 或 Cmd+F）这段代码：`{/* 桌面端菜单 */}`。
你会看到类似这样的代码：
```javascript
<Link to="/journal" className="pixel-btn text-sm">
  <MagneticText text="[ Journal ]" />
</Link>
<Link to="/gallery" className="pixel-btn text-sm">
  <MagneticText text="[ Gallery ]" />
</Link>
```
在它们下面，添加你的新菜单：
```javascript
<Link to="/about" className="pixel-btn text-sm">
  <MagneticText text="[ About ]" />
</Link>
```

### 第二步：添加手机端菜单
继续在 `src/App.tsx` 文件中搜索：`{/* 移动端菜单遮罩层 */}`。
往下找，你会看到包含 `Home`, `Journal`, `Gallery` 的列表。
在 `Gallery` 这一行下面，添加你的新菜单：
```javascript
<Link to="/about" className="pixel-btn w-full text-center" onClick={() => setMobileMenuOpen(false)}>
  <MagneticText text="About" />
</Link>
```

*(注：如果你添加了 `/about` 链接，你还需要在代码底部的 `<Routes>` 里面添加对应的页面组件，如果你需要新建页面，可以随时告诉我帮你写代码！)*

---

## 💬 3. 评论功能 (Gitalk) 准备工作

你提到需要使用 Gitalk 作为评论系统。Gitalk 是基于 GitHub Issue 的，因此你需要去 GitHub 申请一个“通行证”（OAuth App）。请按照以下步骤操作：

1. 登录你的 [GitHub 账号](https://github.com/)。
2. 点击右上角头像 -> **Settings** (设置)。
3. 在左侧菜单滑到最底部，点击 **Developer settings**。
4. 点击左侧的 **OAuth Apps**，然后点击 **New OAuth App** 按钮。
5. 填写信息：
   - **Application name**: 你的博客名字（比如 `My Pixel Blog`）
   - **Homepage URL**: 你的网站首页链接（比如 `https://你的网站域名.com`）
   - **Application description**: 随便填
   - **Authorization callback URL**: 填和 Homepage URL 一样的链接。
6. 点击 **Register application**。
7. 注册成功后，你会看到一个 **Client ID**。把它复制保存下来。
8. 点击 **Generate a new client secret**，生成一个 **Client Secret**。把它复制保存下来（注意，这个密码只显示一次！）。

**准备好 `Client ID` 和 `Client Secret` 后，请把它们发给我，我就可以帮你把 Gitalk 评论区加到博文正文的底部了！**

---

## 🏆 4. 关于账号、成就与贴纸系统

这个功能比较复杂，需要用到数据库（Firebase）来记录每个用户的阅读量和贴纸数据。
目前我正在等待你确认 Firebase 的设置。一旦配置完成，我就会开始编写这部分的代码！

---

## 🚀 5. 如何将网站免费部署到 GitHub Pages？

你想让全世界都能访问你的博客吗？你可以使用 GitHub Pages 免费托管它！以下是小白专属部署步骤：

### 第一步：将代码导出到 GitHub
1. 在当前 AI Studio 界面的右上角（或者设置菜单中），找到 **Export to GitHub**（导出到 GitHub）选项。
2. 按照提示连接你的 GitHub 账号，并创建一个新的代码仓库（Repository），比如命名为 `my-pixel-blog`。

### 第二步：修改 Vite 配置 (非常重要)
在部署之前，你需要告诉系统你的网站路径。
1. 在 GitHub 上打开你刚创建的仓库，找到 `vite.config.ts` 文件并点击编辑（铅笔图标）。
2. 修改它，添加 `base` 属性。如果你的仓库名叫 `my-pixel-blog`，代码应该改成这样：
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/my-pixel-blog/', // ⚠️ 这里换成你的仓库名字！
})
```
保存提交（Commit changes）。

### 第三步：设置 GitHub Actions 自动部署
1. 在你的 GitHub 仓库页面，点击顶部的 **Settings** (设置) 选项卡。
2. 在左侧菜单找到 **Pages**。
3. 在 **Build and deployment** 下的 **Source** 下拉菜单中，选择 **GitHub Actions**。
4. GitHub 会自动推荐一些工作流（Workflows），点击 **Static HTML** 或者搜索 **Vite** 的部署模板。
5. **更简单的做法**：你可以直接在 AI Studio 里告诉我：“**请帮我配置好 GitHub Pages 的自动部署文件**”。我会直接在代码里生成一个 `.github/workflows/deploy.yml` 文件。这样你导出到 GitHub 后，它就会**全自动**完成部署，你什么都不用管！

### 第四步：等待部署完成
配置好之后，每次你修改代码并保存到 GitHub，它都会自动帮你重新部署。
你可以在仓库顶部的 **Actions** 标签页看到进度（一个黄色的转圈圈，变成绿色的勾勾就代表成功了）。
完成后，回到 **Settings -> Pages** 里，你就能看到你的专属网站链接啦！点击它就可以访问你的博客了。
