////////////////////////////////////////////////////////////////////////////
// Todo Class
////////////////////////////////////////////////////////////////////////////

function Todo(raw)
{
    var self = this;

    function buildHtml()
    {
        var formattedMessage = self.message;

        var contextRegex = /\s(@)(\w+)(?=\W|$)/g;
        formattedMessage = formattedMessage.replace(contextRegex,
                                                    '<span class="contextFlag">$1</span><span class="context">$2</span>');

        var projectRegex = /\s(\+)(\w+)(?=\W|$)/g;
        formattedMessage = formattedMessage.replace(projectRegex,
                                                    '<span class="projectFlag">$1</span><span class="project">$2</span>');

        return formattedMessage;
    }

    // The completed flag must be first thing in a todo string
    // therefore this function must be called first.
    function extractCompleted(text)
    {
        var completedRegex = /^(x )(((19|20)[0-9]{2}[\-](0[1-9]|1[012])[\-](0[1-9]|[12][0-9]|3[01])\s)?)/;
        var match = completedRegex.exec(text);
        if (match !== null)
        {
            self.completed = ko.observable(true);
            self.completedDate = ko.observable(match[2]);
            text = $.trim(text.replace(completedRegex, ''));
        }
        else
        {
            self.completed = ko.observable(false);
            self.completedDate = ko.observable("");
        }

        return text;
    }

    // Expects priority to be first thing in string
    // this function should therefore be called after extractCompleted
    function extractPriority(text)
    {
        var priorityRegex = /^\(([A-Z])\)\s/;
        var match = priorityRegex.exec(text);
        if (match !== null)
        {
            self.priority = match[1];
            text = $.trim(text.replace(priorityRegex, ''));
        }
        else
        {
            self.priority = null;
        }

        return text;
    }

    // Expects create date to be first thing in string
    // this function shuold therefore be called after extractPriority
    function extractCreateDate(text)
    {
        var dateRegex = /^((19|20)[0-9]{2}[\-](0[1-9]|1[012])[\-](0[1-9]|[12][0-9]|3[01]))\s/;
        var match = dateRegex.exec(text);
        if (match !== null)
        {
            self.createDate = match[1];
            text = $.trim(text.replace(dateRegex, ''));
        }
        else
        {
            self.createDate = null;
        }

        return text;
    }

    function extractProjects()
    {
        self.projects = TodoHelpers.extractFlagged(self.message, '\\+');
    }

    function extractContexts()
    {
        self.contexts = TodoHelpers.extractFlagged(self.message, '@');
    }

    self.toString = function()
    {
        var result = "";
        if (self.completed())
        {
            result += "x ";
            result += self.completedDate() + " ";
        }

        if (self.priority !== null)
        {
            result += "(" + self.priority + ") ";
        }

        if (self.createDate !== null &&
            self.createDate !== '' &&
            /^((19|20)[0-9]{2}[\-](0[1-9]|1[012])[\-](0[1-9]|[12][0-9]|3[01]))$/.test(self.createDate))
        {
            result += self.createDate + " ";
        }

        result += self.message;
        return result;
    };

    self.fromString = function(text)
    {
        var workingData = text;
        workingData = extractCompleted(workingData);
        workingData = extractPriority(workingData);
        workingData = extractCreateDate(workingData);

        self.raw = text;
        self.message = workingData;
        self.formatted = buildHtml();

        extractProjects();
        extractContexts();
    };

    // Defaults
    self.raw = "";
    self.completed = ko.observable(false);
    self.completedDate = ko.observable();
    self.priority = null;
    self.createDate = null;
    self.message = "";
    self.contexts = [];
    self.projects = [];
    self.formatted = "";

    // Construction
    self.fromString(raw);
}