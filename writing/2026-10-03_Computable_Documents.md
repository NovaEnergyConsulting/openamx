# What if the document could do the calculation?

Good engineering depends on good documentation. We use documents to explain requirements, record decisions, show calculations and communicate what needs to happen next.

Yet the knowledge behind an engineering decision is often spread across several files: a report explains the design, a spreadsheet calculates its performance, and other documents record the inputs, assumptions and revisions. Each file may be clear and correct on its own. The difficulty is keeping them all in agreement.

We respond with document-management systems, review processes, permissions and reminders. These are sensible ways to manage important information. But when the same knowledge is copied into different places, keeping those places aligned becomes a continuing cost and a source of risk.

What if the problem is not that we need to manage our documents better, but that we have separated things that belong together?

## One source for what we know and what we calculate

In a [previous article](https://lnkd.in/p/gNxk-Vq9), I argued that we do not need to maintain a divide between the **representation** and the **computation** of engineering knowledge.

An engineering task needs both. We describe a system, its assumptions and the question we want to answer; then we calculate the result. An electrical engineer might explain how a network is configured and calculate the power flows between its nodes. A mechanical engineer might describe several design options and compare the stresses and deflections of each.

These parts have traditionally lived in different places. The report is written for people; the spreadsheet is built to calculate. When either changes, someone must remember to update the other. A copied result can become an orphan: still visible in the report, no longer connected to the calculation that produced it.

There was a good reason for this separation. When explanations were recorded on paper and calculations performed with beads, an abacus or a mechanical adding machine, representation and computation were different activities using different tools. When computers arrived, we carried familiar distinctions into the digital world. We had documents, spreadsheets, folders and windows: useful metaphors, but not limits imposed by the computer itself.

The distinction is now often more habit than necessity. We can keep the explanation and the calculation together, so the statement of a result is connected to the computation that gives it meaning.

With OpenAMX, the **representation is the computation**. This does not mean that unstructured prose somehow executes itself. It means a document can include readable explanation alongside explicit, executable calculations, with the results represented in the same document. The account of the knowledge and the working of that knowledge are parts of one thing.

## Why plain text?

The best way to encode this computable representation, I believe, is plain text.

Text is one of the most accessible ways we have to express and preserve human knowledge. We can read it without a specialised application, write and edit it with many tools, compare changes over time, and share it across systems. It can be stored, transmitted and revisited without depending on one particular vendor or interface.

This matters because a source of truth should be available to the people who need to understand it. If the knowledge is hidden inside a specialised file or a chain of disconnected tools, it may be possible to process it, but it is harder for people to inspect, discuss and maintain.

Plain text can still carry structure and rules that software can understand. In OpenAMX, Markdown provides the readable narrative, while designated `amx` code blocks contain executable calculations and inline expressions can show their results in the text. The same file can be read as an explanation and evaluated as a computation.

As our tools have become more capable, we have spent decades learning specialised interfaces and encodings. Now, as large language models bring renewed attention to language, it is worth asking whether we can make the computer do more of the translating. The burden should be on the machine to understand a useful, readable representation—not on every person to reconstruct what a collection of files is meant to say.

## Ideas become clearer when we try them

An idea can sound compelling in the abstract and still fail when someone tries to use it. I believe one of the best ways to test an idea is to give it a tangible embodiment: something people can examine, use and respond to.

Real use brings questions that theory alone cannot settle. Is the representation understandable? Can someone follow the calculation? Does the approach fit the work, or does it introduce a new kind of friction? The answers help us improve an idea—or decide to discard it.

For around thirty years, I have been returning to the idea that knowledge and its computation should be brought closer together. OpenAMX is my latest attempt to make that idea real, share it publicly and learn from how people use it.

## OpenAMX: computable documents

OpenAMX is an open-source, text-based format and toolset for **computable documents**. It brings Markdown narrative together with executable `amx` code blocks and inline expressions, so a document can explain an analysis and calculate its results in one readable, versionable file.

The goal is not simply to produce another file format, or to claim that one tool can solve every documentation problem. OpenAMX is an implementation of a particular idea: that the explanation of knowledge and the calculation based on it can live in the same document, rather than being maintained as separate and potentially drifting representations.

That does not make the document automatically correct. The assumptions still need to be sound, the calculations still need to be checked, and people still need to exercise engineering judgement. But keeping the representation and computation together gives us a better starting point: one place to read, inspect, discuss and revise.

This first release already includes a cross-platform desktop application, a command-line tool and a VS Code extension. The language supports features such as tables, charts and units of measure, as well as importing and validating CSV and JSON data. You can also render documents as reports and export them in different formats.

There is much more to show than I can cover here. I will explore specific features in future articles, including how they work and what they make possible. In the meantime, you can [visit the GitHub releases page](https://github.com/NovaEnergyConsulting/openamx/releases) to download the application and try OpenAMX for yourself.

I am sharing OpenAMX because I want this idea to be tested beyond my own desk. Use it, question it, and tell me where it helps or where it gets in the way. A working implementation is not the end of the argument; it is a way to make the argument concrete.

The ambition is simple: knowledge should be encoded and calculated in a single source. With OpenAMX, the document is not merely a report about the computation. The representation is the computation.
