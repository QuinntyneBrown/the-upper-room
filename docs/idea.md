- contact management
    - able to basic info, address,phone foreach person
    - able to tag and add notes
- partner management 
    - able to basic info, address,phone foreach partner organization
    - able to add/ remove contacts (contact management)
    - able to tag and add notes
- kanban board
    - drag tickets across columns
    - boards and columns configurable and data driven
    - angular material / cdk drag and drop

- hackathon (with partner) idea management
- event meetup management
    - (potential) location maanagement
    - calendar to see events (past, present, potential)
- platform for city leads in faith tech orgnaization (see https://www.faithtech.com/)
- mobile first web app that also looks great and works well on large screens
- angular material components for all frontend ui (see https://m3.material.io/)
- .NET backend
    - clean architecture
    - free version of MediatR
    - Microsoft Sql Server Database
    - backend/TheUpperRoom.sln (old style solution file format)
        backend/src <-- TheUpperRoom.Api, etc..
        backend/tests <-- backend tests
- PKCE authorization / full user management / RBAC implementation database to frontend
- frontend is angular workspace split into libraries and apps
    - BEM naming convention for all html css classes
    - all components MUST BE splity into FILE PER TYPE (html, scss, ts). NO SINGLE FILE COMPONENTS
    - api library for models and services needed to comunicate with te backend
        - exposes an interfsce for each service
            foo.service.ts
            foo.service.contract.ts <- includes typescript interface and injection token
    - components library for all reusable ui components. buttons, headers, don't depend on api library
    - domain library for ui components that depend on api library    
        - exposes an interfsce for each service (if any)
            foo.service.ts
            foo.service.contract.ts <- includes typescript interface and injection token
    - the-upper-room application that depends on api, components, and domain libraries
        - e2e testing using playwright page object model for important functionality