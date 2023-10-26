#!/usr/bin/env node

/**
 * to make npm link work, we need to start the file with "#!/usr/bin/env node"
 * but that is not possible in typescript, so we need to create this file as a wrapper...
 */

// eslint-disable-next-line
require('./index.js');
