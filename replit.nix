{pkgs}: {
  deps = [
    pkgs.sox
    pkgs.nodejs
    pkgs.nodePackages.typescript-language-server
    pkgs.postgresql
  ];
}
