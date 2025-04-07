# streaming-logs-react

Created with CodeSandbox

## Dependency install

Use your mechanism of choice to install Node and pnpm. Tested with:

- node 20 (CodeSandbox provides 20.12.1; I used 20.18.1 locally)
- pnpm 8 (CodeSandbox provides 8.15.6; I used 8.15.9 locally)

Then install JS/TS dependencies with `pnpm install`.

## Running the app for local development

Run `pnpm start` to run a development server at http://localhost:3000/. This
command will likely also automatically open the site in your default browser,
but if not, you can explicitly navigate to it.

## Notes

The URL of the log source is hardcoded for now, but could easily be determined
by the surrounding application and updated at runtime as necessary.

In a production application, we'd probably want to implement virtual paging to
only render a portion of the log to DOM at once, based on the user's viewport.
There would be some product questions there around maintaining statefulness of
the row expansion when the row gets swapped out and back into the rendered DOM,
etc.

For the timeline graph, I'd probably move toward chunking the log by histogram
bucket, either directly in useLogStream or in a hook that wraps around that.
Short of implementing an infinite-scroll viewer, that might change also improve
rendering performance a little if the DOM structure was also segmented by chunk.
