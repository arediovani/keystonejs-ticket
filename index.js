const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { Text, Checkbox, Password, DateTime, Select, Integer } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');


const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');
const PROJECT_NAME = 'ticket-app';
const adapterConfig = { mongoUri: 'mongodb://localhost/ticket-app' };


const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),

});

// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) => Boolean(user && user.isAdmin);
const userOwnsItem = ({ authentication: { item: user } }) => {
  if (!user) {
    return false;
  }
  return { id: user.id };
};

const userIsAdminOrOwner = auth => {
  const isAdmin = access.userIsAdmin(auth);
  const isOwner = access.userOwnsItem(auth);
  return isAdmin ? isAdmin : isOwner;
};

const access = { userIsAdmin, userOwnsItem, userIsAdminOrOwner };

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      isUnique: true,
    },
    isAdmin: {
      type: Checkbox,
      // Field-level access controls
      // Here, we set more restrictive field access so a non-admin cannot make themselves admin.
      access: {
        update: access.userIsAdmin,
      },
    },
    password: {
      type: Password,
    },
  },
  // List-level access controls
  access: {
    read: access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  },
});
const typeofticket = [
  { value: 'difekt', label: 'difekt' },
  { value: 'linje_e_re', label: 'Linje e re' },
];
const statusofticket=[
  {value:'i_pa_caktuat',labal:'I pa caktuar'},
  {value:'perfundar', label:'perfunduar'},
  {value:'info_i_gabuar', label:"Informacion i gabar"},
  {value:'nuk_pergjigjet',label:"Nuk pergjigjet"},
]
keystone.createList('Ticket', {
  fields: {
    date: {
      // access:{
      //   read: false,
      //   update: false,
      //   create: false,
      //   delete: false,
      // },
      type: DateTime,
      yearRangeFrom: 1901,
      yearRangeTo: 2018,
      yearPickerType: 'auto',
      defaultValue: Date()
    },
    message: {
      type: Text
    },
    clientName: {
      type: Text,
      isRequired: true
    },
    address: {
      type: Text
    },
    phone: {
      type: Integer,
      isRequired: true
    },
    type: {
      type:Select,
      options:typeofticket,
      dataType:'string'
     
    },
    status:{
      type:Select,
      options:statusofticket,
      dataType:'string',
      defaultValue:'pacaktuar'
    }
  }
})

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      name: PROJECT_NAME,
      enableDefaultRoute: true,
      authStrategy,
    }),
  ],
};
