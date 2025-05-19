# A first level heading

## A second level heading

### A third level heading

#### A fourth level heading

##### A fifth level heading

###### A sixth level heading

[//]: # (Styling text)

Markdown supports various **emphasis** styles to enhance your text formatting.

You can make text **bold** using either `**double asterisks**` or `__double underscores__`.  
For example: **This is bold text** and __this is also bold__.

To *italicize* text, use `*asterisks*` or `_underscores_`.  
Example: *This text is italicized* or _this too_.

Strikethrough is done using `~~tildes~~`:  
~~This was mistaken text~~ but now corrected.

You can **combine bold and _italic_** like so:  
**This part is _extremely_ important**.

Or go even further with ***bold and italic all at once*** using three asterisks:  
***All this text is important***.

HTML-style tags work for special cases like subscript and superscript:

This is H<sub>2</sub>O, not to be confused with H<sup>2</sup>.  
In formulas like E = mc<sup>2</sup>, superscript is essential.

Underline isn’t native in Markdown, but you can use HTML tags:  
This is an <ins>underlined</ins> word.

> Combine all of them? Sure!  
> <ins>***Even _this_ is <sub>wild</sub><sup>!</sup>***</ins>

[//]: # (Quoting text)

You can quote text with a >.

Text that is not a quote

> Text that is a quote

[//]: # (Quoting code)

To format code or text into its own distinct block, use triple backticks.

```typescript
interface MyType {
    property: string;
}
```

[//]: # (Color Models)

In issues, pull requests, and discussions, you can call out colors within a sentence by using backticks. A supported
color model within backticks will display a visualization of the color.

The background color is `#ffffff` for light mode and `#000000` for dark mode.

[//]: # (Links)

You can create an inline link by wrapping link text in brackets [ ], and then wrapping the URL in parentheses ( ). You
can also use the keyboard shortcut Command+K to create a link. When you have text selected, you can paste a URL from
your clipboard to automatically create a link from the selection.

This site was built using [GitHub Pages](https://pages.github.com/)

[//]: # (Relative links)

A relative link is a link that is relative to the current file. For example, if you have a README file in root of your
repository, and you have another file in docs/CONTRIBUTING.md, the relative link to CONTRIBUTING.md in your README might
look like this:
[Contribution guidelines for this project](docs/CONTRIBUTING.md)

[//]: # (Custom anchors)

# Section Heading

Some body text of this section.

<a name="my-custom-anchor-point"></a>
Some text I want to provide a direct link to, but which doesn't have its own heading.

(… more content…)

[A link to that custom anchor](#my-custom-anchor-point)

[//]: # (Link breaks)

[//]: # (Include two spaces at the end of the first line.)

This example  
Will span two lines

[//]: # (Include a backslash at the end of the first line.)

This example\
Will span two lines

[//]: # (Include an HTML single line break tag at the end of the first line.)

This example<br/>
Will span two lines

[//]: # (Images)

You can display an image by adding ! and wrapping the alt text in [ ]. Alt text is a short text equivalent of the
information in the image. Then, wrap the link for the image in parentheses ().

![Screenshot of a comment on a GitHub issue showing an image, added in the Markdown, of an Octocat smiling and raising a tentacle.](https://myoctocat.com/assets/images/base-octocat.svg)

[//]: # (Lists)

You can make an unordered list by preceding one or more lines of text with -, *, or +.

- George Washington
- John Adams 
- Thomas Jefferson

Using *

* George Washington
* John Adams
*Thomas Jefferson

Using +

+ George Washington
+ John Adams 
+ Thomas Jefferson

To order your list, precede each line with a number.

1. James Madison
2. James Monroe
3. John Quincy Adams

You can create a nested list by indenting one or more list items below another item.

1. First list item
    - First nested list item
        - Second nested list item

[//]: # (Task list)

To create a task list, preface list items with a hyphen and space followed by [ ]. To mark a task as complete, use [x].

- [x] #739
- [ ] https://github.com/octo-org/octo-repo/issues/740
- [ ] Add delight to the experience when all tasks are complete :tada: